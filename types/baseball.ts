export type ApiResponse<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; message: string; meta?: Record<string, unknown> };

export interface ScheduleGame {
  id: string;
  date: string;
  time: string;
  stadium: string;
  awayTeam: string;
  homeTeam: string;
  awayScore?: number | null;
  homeScore?: number | null;
  status: string;
  broadcast?: string;
  sourceUrl: string;
}

export interface ScoreboardGame extends ScheduleGame {
  inning?: string;
  balls?: number | null;
  strikes?: number | null;
  outs?: number | null;
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
  innings: Array<{
    inning: number;
    away?: number | null;
    home?: number | null;
  }>;
  lineups: Array<{
    team: string;
    players: string[];
  }>;
  playByPlay: Array<{
    inning: string;
    text: string;
    timestamp?: string;
  }>;
}
