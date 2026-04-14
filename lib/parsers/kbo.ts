import * as cheerio from "cheerio";
import type {
  HitterStatRow,
  PitcherStatRow,
  ScheduleGame,
  ScoreboardGame,
  StandingRow,
  TeamHittingRow,
  TeamPitchingRow
} from "@/types/baseball";

type TableRow = {
  headers: string[];
  cells: string[];
};

type KboGridCell = {
  Text?: string;
  Class?: string | null;
  RowSpan?: string | null;
};

type KboGridRow = {
  row?: KboGridCell[];
};

type KboGridResponse = {
  rows?: KboGridRow[];
};

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();
}

export function toNumber(value: string | number | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const normalized = normalizeText(value).replace(/,/g, "");
  if (!normalized || normalized === "-" || normalized === "무") return null;

  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : null;
}

function load(html: string) {
  return cheerio.load(html);
}

function textFromHtml(html: string | undefined): string {
  return normalizeText(load(`<div>${html ?? ""}</div>`)("div").text());
}

function getTableRows(html: string, tableSelectors: string[]): TableRow[] {
  const $ = load(html);
  const rows: TableRow[] = [];
  const selector = tableSelectors.join(",");
  const tables = $(selector).length ? $(selector) : $("table");

  tables.each((_, table) => {
    const headers = $(table)
      .find("thead th, tr:first-child th, tr:first-child td")
      .map((__, cell) => normalizeText($(cell).text()))
      .get()
      .filter(Boolean);

    $(table)
      .find("tbody tr, tr")
      .each((__, tr) => {
        const cells = $(tr)
          .find("td")
          .map((___, cell) => normalizeText($(cell).text()))
          .get()
          .filter((cell) => cell.length > 0);

        if (cells.length >= 2) {
          rows.push({ headers, cells });
        }
      });
  });

  return rows;
}

function valueByHeader(row: TableRow, headerCandidates: string[], fallbackIndex: number): string {
  const index = row.headers.findIndex((header) =>
    headerCandidates.some((candidate) => header.includes(candidate))
  );

  return row.cells[index >= 0 ? index : fallbackIndex] ?? "";
}

function gameId(date: string, awayTeam: string, homeTeam: string, index: number) {
  return `${date}-${awayTeam || "away"}-${homeTeam || "home"}-${index}`.replace(/[^\w가-힣-]+/g, "-");
}

function splitMatchup(text: string): Pick<ScheduleGame, "awayTeam" | "homeTeam" | "awayScore" | "homeScore"> {
  const normalized = normalizeText(text);
  const scoreMatch = normalized.match(/(.+?)\s+(\d+)\s*[:：]\s*(\d+)\s+(.+)/);
  if (scoreMatch) {
    return {
      awayTeam: normalizeText(scoreMatch[1]),
      awayScore: toNumber(scoreMatch[2]),
      homeScore: toNumber(scoreMatch[3]),
      homeTeam: normalizeText(scoreMatch[4])
    };
  }

  const vsParts = normalized.split(/\s*(?:vs|VS|@|대)\s*/);
  if (vsParts.length >= 2) {
    return {
      awayTeam: normalizeText(vsParts[0]),
      homeTeam: normalizeText(vsParts[1]),
      awayScore: null,
      homeScore: null
    };
  }

  return { awayTeam: "", homeTeam: normalized, awayScore: null, homeScore: null };
}

export function parseSchedule(html: string, date: string, sourceUrl: string): ScheduleGame[] {
  const rows = getTableRows(html, [".tbl-type06", ".tbl", ".tblSchedule", "#tblScheduleList"]);

  return rows
    .map((row, index): ScheduleGame | null => {
      const time = valueByHeader(row, ["시간", "Time"], 0);
      const matchup = valueByHeader(row, ["경기", "팀", "Game"], 1) || row.cells.slice(1, 4).join(" ");
      const stadium = valueByHeader(row, ["구장", "장소", "Stadium"], row.cells.length - 2);
      const status = valueByHeader(row, ["상태", "비고", "Status"], row.cells.length - 1) || "예정";
      const broadcast = valueByHeader(row, ["중계", "TV"], row.cells.length - 1);
      const teams = splitMatchup(matchup);

      if (!teams.awayTeam && !teams.homeTeam) return null;

      return {
        id: gameId(date, teams.awayTeam, teams.homeTeam, index),
        date,
        time,
        stadium,
        awayTeam: teams.awayTeam,
        homeTeam: teams.homeTeam,
        awayScore: teams.awayScore,
        homeScore: teams.homeScore,
        status,
        broadcast,
        sourceUrl
      };
    })
    .filter(Boolean) as ScheduleGame[];
}

export function parseScheduleGrid(
  payload: KboGridResponse,
  targetDate: string,
  sourceUrl: string
): ScheduleGame[] {
  const rows = payload.rows ?? [];
  let currentDate = "";

  return rows
    .map((gridRow, index): ScheduleGame | null => {
      const cells = gridRow.row ?? [];
      const dateCell = cells.find((cell) => cell.Class === "day");
      if (dateCell?.Text) {
        const match = textFromHtml(dateCell.Text).match(/(\d{2})\.(\d{2})/);
        if (match) {
          currentDate = `${targetDate.slice(0, 4)}-${match[1]}-${match[2]}`;
        }
      }

      if (currentDate !== targetDate) return null;

      const timeCell = cells.find((cell) => cell.Class === "time");
      const playCell = cells.find((cell) => cell.Class === "play");
      if (!playCell?.Text) return null;

      const $play = load(`<div>${playCell.Text}</div>`);
      const spans = $play("span")
        .map((_, span) => normalizeText($play(span).text()))
        .get()
        .filter(Boolean);
      const playText = textFromHtml(playCell.Text);
      const teams = spans.length >= 5
        ? {
            awayTeam: spans[0],
            awayScore: toNumber(spans[1]),
            homeScore: toNumber(spans[3]),
            homeTeam: spans[4]
          }
        : splitMatchup(playText);

      const stadium = textFromHtml(cells.at(-2)?.Text);
      const note = textFromHtml(cells.at(-1)?.Text);
      const broadcast = textFromHtml(cells.find((cell) => !cell.Class && /TV|SPO|MBC|KBS|KN|T/.test(textFromHtml(cell.Text)))?.Text);
      const status = note && note !== "-" ? note : teams.awayScore !== null || teams.homeScore !== null ? "종료" : "예정";

      return {
        id: gameId(currentDate, teams.awayTeam, teams.homeTeam, index),
        date: currentDate,
        time: textFromHtml(timeCell?.Text),
        stadium,
        awayTeam: teams.awayTeam,
        homeTeam: teams.homeTeam,
        awayScore: teams.awayScore,
        homeScore: teams.homeScore,
        status,
        broadcast,
        sourceUrl
      };
    })
    .filter(Boolean) as ScheduleGame[];
}

export function parseScoreboard(html: string, date: string, sourceUrl: string): ScoreboardGame[] {
  const schedule = parseSchedule(html, date, sourceUrl);

  return schedule.map((game) => ({
    ...game,
    inning: /종료|취소|예정/.test(game.status) ? game.status : game.status || "진행",
    balls: null,
    strikes: null,
    outs: null
  }));
}

export function parseStandings(html: string): StandingRow[] {
  const rows = getTableRows(html, [".tData", ".tbl", ".tbl-type06"]);

  return rows
    .map((row): StandingRow | null => {
      const team = valueByHeader(row, ["팀", "Team"], 1);
      if (!team || team.includes("팀명")) return null;

      return {
        rank: toNumber(valueByHeader(row, ["순위", "Rank"], 0)),
        team,
        games: toNumber(valueByHeader(row, ["경기", "G"], 2)),
        wins: toNumber(valueByHeader(row, ["승", "W"], 3)),
        losses: toNumber(valueByHeader(row, ["패", "L"], 4)),
        draws: toNumber(valueByHeader(row, ["무", "D"], 5)),
        winningRate: toNumber(valueByHeader(row, ["승률", "PCT"], 6)),
        gamesBehind: valueByHeader(row, ["게임차", "GB"], 7),
        streak: valueByHeader(row, ["연속", "Streak"], row.cells.length - 1)
      };
    })
    .filter(Boolean) as StandingRow[];
}

export function parseHitterStats(html: string): HitterStatRow[] {
  const rows = getTableRows(html, [".tData", ".tbl", ".tbl-type06"]);

  return rows
    .map((row): HitterStatRow | null => {
      const player = valueByHeader(row, ["선수", "Player"], 1);
      if (!player || player.includes("선수")) return null;

      return {
        rank: toNumber(valueByHeader(row, ["순위", "Rank"], 0)),
        player,
        team: valueByHeader(row, ["팀", "Team"], 2),
        avg: toNumber(valueByHeader(row, ["타율", "AVG"], 3)),
        games: toNumber(valueByHeader(row, ["경기", "G"], 4)),
        atBats: toNumber(valueByHeader(row, ["타수", "AB"], 5)),
        hits: toNumber(valueByHeader(row, ["안타", "H"], 6)),
        homeRuns: toNumber(valueByHeader(row, ["홈런", "HR"], 7)),
        rbi: toNumber(valueByHeader(row, ["타점", "RBI"], 8)),
        ops: toNumber(valueByHeader(row, ["OPS"], row.cells.length - 1))
      };
    })
    .filter(Boolean) as HitterStatRow[];
}

export function parsePitcherStats(html: string): PitcherStatRow[] {
  const rows = getTableRows(html, [".tData", ".tbl", ".tbl-type06"]);

  return rows
    .map((row): PitcherStatRow | null => {
      const player = valueByHeader(row, ["선수", "Player"], 1);
      if (!player || player.includes("선수")) return null;

      return {
        rank: toNumber(valueByHeader(row, ["순위", "Rank"], 0)),
        player,
        team: valueByHeader(row, ["팀", "Team"], 2),
        era: toNumber(valueByHeader(row, ["평균자책", "ERA"], 3)),
        games: toNumber(valueByHeader(row, ["경기", "G"], 4)),
        wins: toNumber(valueByHeader(row, ["승", "W"], 5)),
        losses: toNumber(valueByHeader(row, ["패", "L"], 6)),
        saves: toNumber(valueByHeader(row, ["세", "SV"], 7)),
        holds: toNumber(valueByHeader(row, ["홀", "HLD"], 8)),
        strikeouts: toNumber(valueByHeader(row, ["삼진", "SO", "K"], row.cells.length - 1))
      };
    })
    .filter(Boolean) as PitcherStatRow[];
}

export function parseTeamHittingStats(html: string): TeamHittingRow[] {
  return parseHitterStats(html).map((row) => ({
    rank: row.rank,
    team: row.player || row.team,
    avg: row.avg,
    games: row.games,
    runs: null,
    hits: row.hits,
    homeRuns: row.homeRuns,
    rbi: row.rbi,
    ops: row.ops
  }));
}

export function parseTeamPitchingStats(html: string): TeamPitchingRow[] {
  return parsePitcherStats(html).map((row) => ({
    rank: row.rank,
    team: row.player || row.team,
    era: row.era,
    games: row.games,
    wins: row.wins,
    losses: row.losses,
    saves: row.saves,
    holds: row.holds,
    strikeouts: row.strikeouts
  }));
}
