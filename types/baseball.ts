export type ApiResponse<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; message: string; meta?: Record<string, unknown> };

export interface ScheduleGame {
  id: string;
  gameId?: string;
  gameDate?: string;
  date: string;
  time: string;
  stadium: string;
  awayTeam: string;
  homeTeam: string;
  awayTeamCode?: string;
  homeTeamCode?: string;
  awayScore?: number | null;
  homeScore?: number | null;
  awayStartingPitcher?: string;
  homeStartingPitcher?: string;
  status: string;
  statusCode?: string;
  broadcast?: string;
  balls?: number | null;
  strikes?: number | null;
  outs?: number | null;
  currentPitcher?: string;
  gameCenterUrl?: string;
  liveUrl?: string;
  sourceUrl: string;
}

export interface ScoreboardGame extends ScheduleGame {
  inning?: string;
  balls?: number | null;
  strikes?: number | null;
  outs?: number | null;
  bases?: string[];
  currentBatter?: string;
  currentPitcher?: string;
}

export interface StandingRow {
  rank: number | null;
  team: string;
  games: number | null;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  winningRate: number | null;
  gamesBehind: string;
  streak: string;
}

export interface HitterStatRow {
  rank: number | null;
  player: string;
  team: string;
  avg: number | null;
  games: number | null;
  atBats: number | null;
  hits: number | null;
  homeRuns: number | null;
  rbi: number | null;
  ops?: number | null;
}

export interface PitcherStatRow {
  rank: number | null;
  player: string;
  team: string;
  era: number | null;
  games: number | null;
  wins: number | null;
  losses: number | null;
  saves: number | null;
  holds: number | null;
  strikeouts: number | null;
}

export interface TeamHittingRow {
  rank: number | null;
  team: string;
  avg: number | null;
  games: number | null;
  runs: number | null;
  hits: number | null;
  homeRuns: number | null;
  rbi: number | null;
  ops?: number | null;
}

export interface TeamPitchingRow {
  rank: number | null;
  team: string;
  era: number | null;
  games: number | null;
  wins: number | null;
  losses: number | null;
  saves: number | null;
  holds: number | null;
  strikeouts: number | null;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
}

export interface GameDetail {
  id: string;
  title: string;
  status: "placeholder" | "ready";
  scoreboard?: ScoreboardGame;
  refreshedAt?: string;
  innings: Array<{
    inning: number;
    away?: number | null;
    home?: number | null;
  }>;
  lineups: Array<{
    team: string;
    players: Array<{
      order?: number | null;
      name: string;
      position?: string;
    }>;
  }>;
  playByPlay: Array<{
    inning: string;
    text: string;
    batter?: string;
    timestamp?: string;
  }>;
}
