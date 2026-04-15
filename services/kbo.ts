import dayjs from "dayjs";
import { getOrSetCache } from "@/lib/cache";
import { fetchFormJson, fetchHtml } from "@/lib/fetcher";
import {
  type KboGameListResponse,
  parseGroundLineups,
  parseHitterStats,
  parseLiveScoreInnings,
  parseLiveText,
  parseMainGameList,
  parsePitcherStats,
  parseSchedule,
  parseScheduleGrid,
  parseScoreboard,
  parseStandings,
  parseTeamHittingStats,
  parseTeamPitchingStats
} from "@/lib/parsers/kbo";
import type { GameDetail, ScheduleGame, ScoreboardGame } from "@/types/baseball";

const KBO = "https://www.koreabaseball.com";
const KBO_MOBILE = "https://m.koreabaseball.com";

function withBase(path: string) {
  return `${KBO}${path}`;
}

function withMobile(path: string) {
  return `${KBO_MOBILE}${path}`;
}

function ymd(date = dayjs().format("YYYY-MM-DD")) {
  return dayjs(date).format("YYYYMMDD");
}

async function getKboGameList(date = dayjs().format("YYYY-MM-DD")) {
  const url = withBase("/ws/Main.asmx/GetKboGameList");
  const body = new URLSearchParams({
    leId: "1",
    srId: "0,1,3,4,5,6,7,9",
    date: ymd(date)
  });

  return fetchFormJson<KboGameListResponse>(url, body, {
    referer: withBase("/Schedule/GameCenter/Main.aspx")
  });
}

export async function getSchedule(date = dayjs().format("YYYY-MM-DD")) {
  return getOrSetCache(`schedule:${date}`, 60, async () => {
    try {
      const url = withBase("/ws/Main.asmx/GetKboGameList");
      const data = await getKboGameList(date);
      const parsed = parseMainGameList(data, url);
      if (parsed.length) return parsed;
    } catch {
      // KBO 게임센터 API가 막히면 기존 일정 API로 graceful fallback 합니다.
    }

    const url = withBase("/ws/Schedule.asmx/GetScheduleList");
    const body = new URLSearchParams({
      leId: "1",
      srIdList: "0,9,6",
      seasonId: dayjs(date).format("YYYY"),
      gameMonth: dayjs(date).format("MM"),
      teamId: ""
    });
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Referer: withBase("/Schedule/Schedule.aspx")
      },
      body
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = parseScheduleGrid(data, date, url);
      if (parsed.length) return parsed;
    }

    const htmlUrl = withBase(`/Schedule/Schedule.aspx?seriesId=0,9&date=${date}`);
    const html = await fetchHtml(htmlUrl);
    return parseSchedule(html, date, htmlUrl);
  });
}

export async function getUpcomingSchedule(days = 14) {
  const normalizedDays = Math.min(Math.max(days, 1), 31);

  return getOrSetCache(`schedule:upcoming:${normalizedDays}`, 60, async () => {
    const dates = Array.from({ length: normalizedDays }, (_, index) =>
      dayjs().add(index, "day").format("YYYY-MM-DD")
    );
    const schedules = await Promise.all(dates.map((date) => getSchedule(date)));

    return schedules.flat();
  });
}

export async function getScoreboard() {
  const date = dayjs().format("YYYY-MM-DD");

  return getOrSetCache("scoreboard", 30, async () => {
    try {
      const games = await getSchedule(date);
      const liveGames = await Promise.all(games.map((game) => enrichLiveGame(game)));
      if (liveGames.length) return liveGames;
    } catch {
      // 스케줄 기반 실시간 API 실패 시 PC 스코어보드 HTML 파서로 fallback 합니다.
    }

    const url = withBase("/Schedule/ScoreBoard.aspx");
    const html = await fetchHtml(url);
    return parseScoreboard(html, date, url);
  });
}

export async function getStandings() {
  return getOrSetCache("standings", 60, async () => {
    const url = withBase("/Record/TeamRank/TeamRank.aspx");
    const html = await fetchHtml(url);
    return parseStandings(html);
  });
}

export async function getPlayerHitterStats() {
  return getOrSetCache("player:hitters", 60, async () => {
    const url = withBase("/Record/Player/HitterBasic/Basic1.aspx");
    const html = await fetchHtml(url);
    return parseHitterStats(html);
  });
}

export async function getPlayerPitcherStats() {
  return getOrSetCache("player:pitchers", 60, async () => {
    const url = withBase("/Record/Player/PitcherBasic/Basic1.aspx");
    const html = await fetchHtml(url);
    return parsePitcherStats(html);
  });
}

export async function getTeamHitterStats() {
  return getOrSetCache("team:hitters", 60, async () => {
    const url = withBase("/Record/Team/Hitter/Basic1.aspx");
    const html = await fetchHtml(url);
    return parseTeamHittingStats(html);
  });
}

export async function getTeamPitcherStats() {
  return getOrSetCache("team:pitchers", 60, async () => {
    const url = withBase("/Record/Team/Pitcher/Basic1.aspx");
    const html = await fetchHtml(url);
    return parseTeamPitchingStats(html);
  });
}

async function fetchGameState(game: ScheduleGame) {
  if (!game.gameId) return null;

  const url = withMobile("/ws/Kbo.asmx/GetGameState");
  const body = new URLSearchParams({
    le_id: "1",
    sr_id: "0",
    g_id: game.gameId
  });

  return fetchFormJson<{ game?: Record<string, unknown>[] }>(url, body, {
    mobile: true,
    referer: game.liveUrl ?? withMobile("/Kbo/Live/Live.aspx")
  });
}

async function fetchLiveScore(game: ScheduleGame) {
  if (!game.gameId) return null;

  const url = withMobile("/ws/Kbo.asmx/GetLiveTextScore");
  const body = new URLSearchParams({
    le_id: "1",
    sr_id: "0",
    g_id: game.gameId,
    sc_id: "0"
  });

  return fetchFormJson<{ scoreTable?: string }>(url, body, {
    mobile: true,
    referer: game.liveUrl ?? withMobile("/Kbo/Live/Live.aspx")
  });
}

async function fetchGround(game: ScheduleGame) {
  if (!game.gameId) return null;

  const url = withMobile("/ws/Kbo.asmx/GetLiveTextGround");
  const body = new URLSearchParams({
    le_id: "1",
    sr_id: "0",
    g_id: game.gameId
  });

  return fetchFormJson<Record<string, unknown>>(url, body, {
    mobile: true,
    referer: game.liveUrl ?? withMobile("/Kbo/Live/Live.aspx")
  });
}

async function fetchLiveText(game: ScheduleGame, inning = "1,2,3,4,5,6,7,8,9,10,11,12") {
  if (!game.gameId) return null;

  const url = withMobile("/ws/Kbo.asmx/GetLiveText");
  const body = new URLSearchParams({
    le_id: "1",
    sr_id: "0",
    g_id: game.gameId,
    inning,
    order: game.statusCode === "3" ? "ASC" : "DESC"
  });

  return fetchFormJson<Record<string, unknown>>(url, body, {
    mobile: true,
    referer: game.liveUrl ?? withMobile("/Kbo/Live/Live.aspx")
  });
}

async function enrichLiveGame(game: ScheduleGame): Promise<ScoreboardGame> {
  let liveState: { game?: Record<string, unknown>[] } | null = null;

  try {
    liveState = await fetchGameState(game);
  } catch {
    liveState = null;
  }

  const state = liveState?.game?.[0];
  const statusCode = String(state?.SECTION_ID ?? game.statusCode ?? "");
  const inning =
    statusCode === "2"
      ? `${state?.INN_NO ?? ""}회${state?.TB_NM ?? ""}`
      : game.status;

  return {
    ...game,
    awayScore: Number.isFinite(Number(state?.A_SCORE_CN)) ? Number(state?.A_SCORE_CN) : game.awayScore,
    homeScore: Number.isFinite(Number(state?.H_SCORE_CN)) ? Number(state?.H_SCORE_CN) : game.homeScore,
    statusCode: statusCode || game.statusCode,
    status: statusCode === "2" ? "진행중" : game.status,
    inning,
    bases: String(state?.BASE_SC ?? "")
      .split("")
      .filter(Boolean)
      .map((base) => `${base}루`),
    balls: game.balls ?? null,
    strikes: game.strikes ?? null,
    outs: game.outs ?? null
  };
}

export async function getGameDetail(id: string): Promise<GameDetail> {
  const decodedId = decodeURIComponent(id);

  return getOrSetCache(`game:${decodedId}`, 15, async () => {
    const gameDate = decodedId.match(/^(\d{8})/)?.[1];
    const date = gameDate
      ? `${gameDate.slice(0, 4)}-${gameDate.slice(4, 6)}-${gameDate.slice(6, 8)}`
      : dayjs().format("YYYY-MM-DD");
    const schedule = await getSchedule(date);
    const baseGame =
      schedule.find((game) => game.gameId === decodedId || game.id === decodedId) ?? schedule[0];

    if (!baseGame) {
      return {
        id: decodedId,
        title: "경기 상세",
        status: "placeholder",
        refreshedAt: new Date().toISOString(),
        innings: [],
        lineups: [],
        playByPlay: []
      };
    }

    const [scoreboard, liveScore, ground, liveText] = await Promise.all([
      enrichLiveGame(baseGame),
      fetchLiveScore(baseGame).catch(() => null),
      fetchGround(baseGame).catch(() => null),
      fetchLiveText(baseGame).catch(() => null)
    ]);

    const lineups = ground
      ? parseGroundLineups(ground, baseGame.awayTeam, baseGame.homeTeam)
      : [];

    if (!lineups.length && (baseGame.awayStartingPitcher || baseGame.homeStartingPitcher)) {
      lineups.push({
        team: "선발 투수",
        players: [
          { name: `${baseGame.awayTeam}: ${baseGame.awayStartingPitcher || "발표 전"}`, position: "원정" },
          { name: `${baseGame.homeTeam}: ${baseGame.homeStartingPitcher || "발표 전"}`, position: "홈" }
        ]
      });
    }

    return {
      id: decodedId,
      title: `${baseGame.awayTeam} vs ${baseGame.homeTeam}`,
      status: "ready",
      scoreboard,
      refreshedAt: new Date().toISOString(),
      innings: liveScore ? parseLiveScoreInnings(liveScore) : [],
      lineups,
      playByPlay: liveText ? parseLiveText(liveText) : []
    };
  });
}
