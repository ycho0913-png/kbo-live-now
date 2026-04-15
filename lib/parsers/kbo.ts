import * as cheerio from "cheerio";
import type {
  GameDetail,
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

export type KboGameListRow = Record<string, string | number | boolean | null | undefined>;

export type KboGameListResponse = {
  game?: KboGameListRow[];
};

type KboLiveGridResponse = {
  rows?: Array<{
    row?: Array<{
      Text?: string;
      Class?: string | null;
    }>;
  }>;
};

type KboLiveTextResponse = {
  listInnTb?: Array<{
    INN_NO?: string | number;
    TB_NM?: string;
    T_NM?: string;
    listBatOrder?: Array<{
      BAT_ORDER_NO?: string | number;
      BAT_P_NM?: string;
      listData?: Array<{
        LIVETEXT_IF?: string;
        TEXTSTYLE_SC?: string;
      }>;
    }>;
  }>;
};

type KboLiveScoreResponse = {
  scoreTable?: string;
};

type KboGroundResponse = {
  listDefense?: Array<{ P_NM?: string; POS_SC?: string | number }>;
  listHitter?: Array<{ P_NM?: string; HIT_DIREC_SC?: string | number }>;
  listRunner?: Array<{ P_NM?: string; POS_SC?: string | number }>;
  listBallCnt?: Array<{ BALL_CN?: string | number; STRIKE_CN?: string | number; OUT_CN?: string | number }>;
  listNextHitter?: Array<{ BAT_ORDER_NO?: string | number; P_NM?: string }>;
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

function gameCenterUrl(gameDate: string, kboGameId: string, section = "START_PIT") {
  if (!gameDate || !kboGameId) return undefined;
  return `https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx?gameDate=${gameDate}&gameId=${kboGameId}&section=${section}`;
}

function liveUrl(gameIdValue: string, srId: string | number | null | undefined = 0) {
  if (!gameIdValue) return undefined;
  return `https://m.koreabaseball.com/Kbo/Live/Live.aspx?p_le_id=1&p_sr_id=${srId ?? 0}&p_g_id=${gameIdValue}`;
}

function statusName(statusCode: string | number | null | undefined, fallback?: string) {
  const code = String(statusCode ?? "");
  if (code === "1") return "경기전";
  if (code === "2") return "진행중";
  if (code === "3") return "종료";
  if (code === "4") return "취소";
  if (code === "5") return "서스펜디드";
  return normalizeText(fallback) || "상태 확인중";
}

function rawString(row: KboGameListRow, key: string): string {
  return normalizeText(String(row[key] ?? ""));
}

function rawNumber(row: KboGameListRow, key: string): number | null {
  return toNumber(row[key] as string | number | null | undefined);
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
      const relayHtml = cells.find((cell) => cell.Class === "relay")?.Text ?? "";
      const gameIdMatch = relayHtml.match(/gameId=([^&'"]+)/);
      const gameDateMatch = relayHtml.match(/gameDate=([^&'"]+)/);
      const kboGameId = gameIdMatch?.[1];
      const gameDate = gameDateMatch?.[1];

      return {
        id: kboGameId || gameId(currentDate, teams.awayTeam, teams.homeTeam, index),
        gameId: kboGameId,
        gameDate,
        date: currentDate,
        time: textFromHtml(timeCell?.Text),
        stadium,
        awayTeam: teams.awayTeam,
        homeTeam: teams.homeTeam,
        awayScore: teams.awayScore,
        homeScore: teams.homeScore,
        status,
        broadcast,
        gameCenterUrl: gameDate && kboGameId ? gameCenterUrl(gameDate, kboGameId) : undefined,
        liveUrl: kboGameId ? liveUrl(kboGameId) : undefined,
        sourceUrl
      };
    })
    .filter(Boolean) as ScheduleGame[];
}

export function parseMainGameList(payload: KboGameListResponse, sourceUrl: string): ScheduleGame[] {
  return (payload.game ?? []).map((row, index) => {
    const gameDate = rawString(row, "G_DT");
    const date = gameDate
      ? `${gameDate.slice(0, 4)}-${gameDate.slice(4, 6)}-${gameDate.slice(6, 8)}`
      : "";
    const kboGameId = rawString(row, "G_ID");
    const srId = typeof row.SR_ID === "boolean" ? 0 : row.SR_ID ?? 0;
    const awayScore = rawNumber(row, "T_SCORE_CN");
    const homeScore = rawNumber(row, "B_SCORE_CN");
    const code = rawString(row, "GAME_STATE_SC");

    return {
      id: kboGameId || gameId(date, rawString(row, "AWAY_NM"), rawString(row, "HOME_NM"), index),
      gameId: kboGameId,
      gameDate,
      date,
      time: rawString(row, "G_TM"),
      stadium: rawString(row, "S_NM"),
      awayTeam: rawString(row, "AWAY_NM"),
      homeTeam: rawString(row, "HOME_NM"),
      awayTeamCode: rawString(row, "AWAY_ID"),
      homeTeamCode: rawString(row, "HOME_ID"),
      awayScore,
      homeScore,
      awayStartingPitcher: rawString(row, "T_PIT_P_NM"),
      homeStartingPitcher: rawString(row, "B_PIT_P_NM"),
      status: statusName(code, rawString(row, "GAME_SC_NM")),
      statusCode: code,
      broadcast: rawString(row, "TV_IF"),
      balls: rawNumber(row, "BALL_CN"),
      strikes: rawNumber(row, "STRIKE_CN"),
      outs: rawNumber(row, "OUT_CN"),
      currentPitcher: rawString(row, "B_P_NM") || rawString(row, "T_P_NM"),
      gameCenterUrl: gameCenterUrl(gameDate, kboGameId, code === "1" ? "START_PIT" : code === "3" ? "REVIEW" : "KEY_PIT"),
      liveUrl: liveUrl(kboGameId, srId),
      sourceUrl
    };
  });
}

export function parseScoreboard(html: string, date: string, sourceUrl: string): ScoreboardGame[] {
  const $ = load(html);
  const cards = $(".smsScore");
  if (!cards.length) {
    const schedule = parseSchedule(html, date, sourceUrl);
    return schedule.map((game) => ({
      ...game,
      inning: /종료|취소|예정/.test(game.status) ? game.status : game.status || "진행",
      balls: null,
      strikes: null,
      outs: null
    }));
  }

  return cards
    .map((index, card): ScoreboardGame => {
      const awayTeam = normalizeText($(card).find(".leftTeam .teamT").text());
      const homeTeam = normalizeText($(card).find(".rightTeam .teamT").text());
      const status = normalizeText($(card).find(".flag").text()) || "상태 확인중";
      const placeText = normalizeText($(card).find(".place").text());
      const placeMatch = placeText.match(/^(.+?)\s+(\d{1,2}:\d{2})/);
      const awayScore = toNumber($(card).find(".leftTeam .score").text());
      const homeScore = toNumber($(card).find(".rightTeam .score").text());
      const scoreRows = $(card).find(".tScore tbody tr");
      const inningCells = scoreRows
        .first()
        .find("td")
        .map((_, cell) => normalizeText($(cell).text()))
        .get();

      return {
        id: gameId(date, awayTeam, homeTeam, index),
        date,
        time: placeMatch?.[2] ?? "",
        stadium: placeMatch?.[1] ?? placeText,
        awayTeam,
        homeTeam,
        awayScore,
        homeScore,
        status,
        inning: status,
        balls: null,
        strikes: null,
        outs: null,
        innings: inningCells,
        sourceUrl
      } as ScoreboardGame;
    })
    .get();
}

export function parseLiveScoreInnings(payload: KboLiveScoreResponse): GameDetail["innings"] {
  if (!payload.scoreTable) return [];

  try {
    const table = JSON.parse(payload.scoreTable) as KboLiveGridResponse;
    const rows = table.rows ?? [];
    const away = rows[0]?.row ?? [];
    const home = rows[1]?.row ?? [];
    const max = Math.max(away.length, home.length);

    return Array.from({ length: max }, (_, index) => ({
      inning: index + 1,
      away: toNumber(textFromHtml(away[index]?.Text)),
      home: toNumber(textFromHtml(home[index]?.Text))
    })).filter((row) => row.away !== null || row.home !== null);
  } catch {
    return [];
  }
}

export function parseGroundLineups(payload: KboGroundResponse, awayTeam: string, homeTeam: string): GameDetail["lineups"] {
  const defense = (payload.listDefense ?? [])
    .map((player) => ({
      order: null,
      name: normalizeText(player.P_NM),
      position: player.POS_SC ? `${player.POS_SC}` : undefined
    }))
    .filter((player) => player.name);

  const nextHitters = (payload.listNextHitter ?? [])
    .map((player) => ({
      order: toNumber(player.BAT_ORDER_NO),
      name: normalizeText(player.P_NM),
      position: "다음 타자"
    }))
    .filter((player) => player.name);

  return [
    { team: homeTeam || "수비팀", players: defense },
    { team: awayTeam || "공격팀", players: nextHitters }
  ].filter((lineup) => lineup.players.length);
}

export function parseLiveText(payload: KboLiveTextResponse): GameDetail["playByPlay"] {
  const result: GameDetail["playByPlay"] = [];

  for (const inning of payload.listInnTb ?? []) {
    const inningLabel = `${inning.INN_NO ?? ""}회${inning.TB_NM ?? ""}`;
    for (const bat of inning.listBatOrder ?? []) {
      for (const item of bat.listData ?? []) {
        const text = textFromHtml(item.LIVETEXT_IF);
        if (!text) continue;
        result.push({
          inning: inningLabel,
          batter: normalizeText(bat.BAT_P_NM),
          text
        });
      }
    }
  }

  return result;
}

export function parseStandings(html: string): StandingRow[] {
  const rows = getTableRows(html, [".tData", ".tbl", ".tbl-type06"]);

  const seen = new Set<string>();

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
    .filter((row): row is StandingRow => {
      if (!row) return false;
      if (!row.rank || row.rank < 1 || row.rank > 10) return false;
      if (seen.has(row.team)) return false;
      seen.add(row.team);
      return true;
    })
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, 10);
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
