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
  seasonId?: string;
  seriesId?: string;
  awayStartingPitcherId?: string;
  homeStartingPitcherId?: string;
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
  matchupAnalysis?: MatchupAnalysis;
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

export interface TeamPowerRow {
  team: string;
  record: string;
  recent: string;
  era: string;
  battingAverage: string;
  averageRuns: string;
  averageAllowed: string;
}

export interface StartingPitcherAnalysis {
  team: string;
  name: string;
  style?: string;
  seasonRecord?: string;
  era: string;
  war: string;
  games: string;
  averageStarterInnings: string;
  qualityStarts: string;
  whip: string;
}

export interface KeyPlayerRow {
  category: string;
  team: string;
  rank: string;
  name: string;
  rate: string;
  record?: string;
}

export interface MatchupAnalysis {
  teamPower: TeamPowerRow[];
  startingPitchers: StartingPitcherAnalysis[];
  keyPlayers: KeyPlayerRow[];
  source: "KBO";
}

export interface GameDetail {
  id: string;
  title: string;
  status: "placeholder" | "ready";
  scoreboard?: ScoreboardGame;
  matchupAnalysis?: MatchupAnalysis;
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

export interface PlayerSearchResult {
  type: "player";
  name: string;
  team: string;
  role: "타자" | "투수" | "타자/투수";
  summary: string;
  hitter?: HitterStatRow;
  pitcher?: PitcherStatRow;
}

export interface TeamSearchResult {
  type: "team";
  team: string;
  summary: string;
  standing?: StandingRow;
  hitting?: TeamHittingRow;
  pitching?: TeamPitchingRow;
  games: ScoreboardGame[];
  upcomingGames: ScheduleGame[];
}

export interface SearchResponse {
  query: string;
  teams: TeamSearchResult[];
  players: PlayerSearchResult[];
}
