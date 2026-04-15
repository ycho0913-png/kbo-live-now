import {
  getPlayerHitterStats,
  getPlayerPitcherStats,
  getScoreboard,
  getStandings,
  getTeamHitterStats,
  getTeamPitcherStats,
  getUpcomingSchedule
} from "@/services/kbo";
import type {
  HitterStatRow,
  PitcherStatRow,
  PlayerSearchResult,
  ScheduleGame,
  ScoreboardGame,
  SearchResponse,
  StandingRow,
  TeamHittingRow,
  TeamPitchingRow,
  TeamSearchResult
} from "@/types/baseball";

function normalize(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, "").toLowerCase();
}

function teamAliases(team: string) {
  const normalized = normalize(team);
  const aliases = new Set([normalized]);

  if (normalized.includes("삼성")) aliases.add("삼성라이온즈");
  if (normalized.includes("kia") || normalized.includes("기아")) aliases.add("기아타이거즈");
  if (normalized.includes("lg")) aliases.add("엘지트윈스");
  if (normalized.includes("두산")) aliases.add("두산베어스");
  if (normalized.includes("롯데")) aliases.add("롯데자이언츠");
  if (normalized.includes("한화")) aliases.add("한화이글스");
  if (normalized.includes("ssg")) aliases.add("ssg랜더스");
  if (normalized.includes("nc")) aliases.add("nc다이노스");
  if (normalized.includes("kt")) aliases.add("kt위즈");
  if (normalized.includes("키움")) aliases.add("키움히어로즈");

  return Array.from(aliases);
}

function matchesTeam(query: string, team: string) {
  const normalizedTeam = normalize(team);
  if (!query || !normalizedTeam) return false;

  return teamAliases(team).some(
    (alias) => alias.includes(query) || query.includes(alias) || normalizedTeam.includes(query)
  );
}

function uniqueTeams(...groups: Array<Array<{ team: string }>>) {
  const seen = new Set<string>();
  const teams: string[] = [];

  for (const group of groups) {
    for (const row of group) {
      const team = row.team;
      const key = normalize(team);
      if (!team || seen.has(key)) continue;
      seen.add(key);
      teams.push(team);
    }
  }

  return teams;
}

function gamesForTeam<T extends ScheduleGame | ScoreboardGame>(games: T[], team: string) {
  return games.filter((game) => matchesTeam(normalize(team), game.awayTeam) || matchesTeam(normalize(team), game.homeTeam));
}

function summarizeTeam(
  team: string,
  standing?: StandingRow,
  hitting?: TeamHittingRow,
  pitching?: TeamPitchingRow
) {
  const rank = standing?.rank ? `${standing.rank}위` : "순위 확인중";
  const record =
    standing?.wins !== null && standing?.wins !== undefined
      ? `${standing.wins}승 ${standing.losses ?? "-"}패 ${standing.draws ?? 0}무`
      : "전적 확인중";
  const avg = hitting?.avg !== null && hitting?.avg !== undefined ? `팀 타율 ${hitting.avg}` : "팀 타율 -";
  const era = pitching?.era !== null && pitching?.era !== undefined ? `팀 ERA ${pitching.era}` : "팀 ERA -";

  return `${team} · ${rank} · ${record} · ${avg} · ${era}`;
}

function summarizePlayer(hitter?: HitterStatRow, pitcher?: PitcherStatRow) {
  if (hitter && pitcher) {
    return `타율 ${hitter.avg ?? "-"} · 홈런 ${hitter.homeRuns ?? "-"} · ERA ${pitcher.era ?? "-"} · 삼진 ${pitcher.strikeouts ?? "-"}`;
  }

  if (hitter) {
    return `타율 ${hitter.avg ?? "-"} · 경기 ${hitter.games ?? "-"} · 안타 ${hitter.hits ?? "-"} · 홈런 ${hitter.homeRuns ?? "-"} · OPS ${hitter.ops ?? "-"}`;
  }

  if (pitcher) {
    return `ERA ${pitcher.era ?? "-"} · 경기 ${pitcher.games ?? "-"} · ${pitcher.wins ?? "-"}승 · 세이브 ${pitcher.saves ?? "-"} · 삼진 ${pitcher.strikeouts ?? "-"}`;
  }

  return "기록 확인중";
}

type PlayerBucket = {
  name?: string;
  team?: string;
  hitter?: HitterStatRow;
  pitcher?: PitcherStatRow;
  role?: PlayerSearchResult["role"];
  summary?: string;
};

function mergePlayers(
  hitters: HitterStatRow[],
  pitchers: PitcherStatRow[],
  games: ScoreboardGame[],
  query: string
) {
  const map = new Map<string, PlayerBucket>();

  for (const hitter of hitters) {
    if (!normalize(hitter.player).includes(query)) continue;
    const key = `${normalize(hitter.team)}:${normalize(hitter.player)}`;
    map.set(key, { ...(map.get(key) ?? {}), name: hitter.player, team: hitter.team, hitter });
  }

  for (const pitcher of pitchers) {
    if (!normalize(pitcher.player).includes(query)) continue;
    const key = `${normalize(pitcher.team)}:${normalize(pitcher.player)}`;
    map.set(key, { ...(map.get(key) ?? {}), name: pitcher.player, team: pitcher.team, pitcher });
  }

  for (const game of games) {
    for (const starter of game.matchupAnalysis?.startingPitchers ?? []) {
      if (!normalize(starter.name).includes(query)) continue;
      const key = `${normalize(starter.team)}:${normalize(starter.name)}`;
      const summary = `선발 투수 · ERA ${starter.era || "-"} · WHIP ${starter.whip || "-"} · QS ${starter.qualityStarts || "-"} · ${starter.seasonRecord || "시즌 기록 확인중"}`;
      map.set(key, {
        ...(map.get(key) ?? {}),
        name: starter.name,
        team: starter.team,
        role: "투수",
        summary
      });
    }

    for (const keyPlayer of game.matchupAnalysis?.keyPlayers ?? []) {
      if (!normalize(keyPlayer.name).includes(query)) continue;
      const key = `${normalize(keyPlayer.team)}:${normalize(keyPlayer.name)}`;
      const summary = `${keyPlayer.category || "키플레이어"} · ${keyPlayer.rank || "-"} · ${keyPlayer.rate || keyPlayer.record || "기록 확인중"}`;
      map.set(key, {
        ...(map.get(key) ?? {}),
        name: keyPlayer.name,
        team: keyPlayer.team,
        role: "타자",
        summary
      });
    }
  }

  return Array.from(map.values()).map((bucket): PlayerSearchResult => {
    const name = bucket.name ?? bucket.hitter?.player ?? bucket.pitcher?.player ?? "";
    const team = bucket.team ?? bucket.hitter?.team ?? bucket.pitcher?.team ?? "";
    const role =
      bucket.hitter && bucket.pitcher
        ? "타자/투수"
        : bucket.hitter
          ? "타자"
          : bucket.pitcher
            ? "투수"
            : bucket.role ?? "타자";

    return {
      type: "player",
      name,
      team,
      role,
      summary: bucket.hitter || bucket.pitcher ? summarizePlayer(bucket.hitter, bucket.pitcher) : bucket.summary || "기록 확인중",
      hitter: bucket.hitter,
      pitcher: bucket.pitcher
    };
  });
}

export async function searchKbo(query: string): Promise<SearchResponse> {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return { query, teams: [], players: [] };
  }

  const [standings, hitters, pitchers, teamHitters, teamPitchers, scoreboard, upcoming] =
    await Promise.all([
      getStandings(),
      getPlayerHitterStats(),
      getPlayerPitcherStats(),
      getTeamHitterStats(),
      getTeamPitcherStats(),
      getScoreboard(),
      getUpcomingSchedule(21)
    ]);

  const teamNames = uniqueTeams(
    standings.map((row) => ({ team: row.team })),
    teamHitters.map((row) => ({ team: row.team })),
    teamPitchers.map((row) => ({ team: row.team })),
    scoreboard.flatMap((game) => [{ team: game.awayTeam }, { team: game.homeTeam }]),
    upcoming.flatMap((game) => [{ team: game.awayTeam }, { team: game.homeTeam }])
  );

  const teams: TeamSearchResult[] = teamNames
    .filter((team) => matchesTeam(normalizedQuery, team))
    .slice(0, 3)
    .map((team) => {
      const standing = standings.find((row) => matchesTeam(normalize(team), row.team));
      const hitting = teamHitters.find((row) => matchesTeam(normalize(team), row.team));
      const pitching = teamPitchers.find((row) => matchesTeam(normalize(team), row.team));
      const games = gamesForTeam(scoreboard, team).slice(0, 2);
      const upcomingGames = gamesForTeam(upcoming, team).slice(0, 5);

      return {
        type: "team",
        team,
        summary: summarizeTeam(team, standing, hitting, pitching),
        standing,
        hitting,
        pitching,
        games,
        upcomingGames
      };
    });

  const players = mergePlayers(hitters, pitchers, scoreboard, normalizedQuery).slice(0, 8);

  return {
    query,
    teams,
    players
  };
}
