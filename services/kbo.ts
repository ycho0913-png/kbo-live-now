import dayjs from "dayjs";
import { getOrSetCache } from "@/lib/cache";
import { fetchHtml } from "@/lib/fetcher";
import {
  parseHitterStats,
  parsePitcherStats,
  parseSchedule,
  parseScheduleGrid,
  parseScoreboard,
  parseStandings,
  parseTeamHittingStats,
  parseTeamPitchingStats
} from "@/lib/parsers/kbo";

const KBO = "https://www.koreabaseball.com";

function withBase(path: string) {
  return `${KBO}${path}`;
}

export async function getSchedule(date = dayjs().format("YYYY-MM-DD")) {
  return getOrSetCache(`schedule:${date}`, 60, async () => {
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
