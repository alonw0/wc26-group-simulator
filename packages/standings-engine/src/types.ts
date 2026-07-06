export interface Team {
  /** Stable id, e.g. "MEX" */
  id: string;
  name: string;
  flag: string;
  /** FIFA world ranking — the final tiebreaker in the official 2026 criteria */
  fifaRanking: number;
}

export interface Group {
  /** "A" through "L" */
  id: string;
  teams: Team[];
}

export interface MatchResult {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
}

/**
 * Optional team-conduct ("fair play") scores, keyed by team id.
 * Yellow −1, second-yellow red −3, direct red −4, yellow+direct red −5.
 * Higher (closer to zero) is better. Defaults to 0 when omitted.
 */
export type ConductScores = Record<string, number>;

export interface TeamStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  conduct: number;
  /** 1-based position after all tiebreakers */
  position: number;
  /** Which criterion separated this team from the one below it, when points were level */
  tiebreaker?: TiebreakerKind;
}

export type TiebreakerKind =
  | "head-to-head points"
  | "head-to-head goal difference"
  | "head-to-head goals scored"
  | "overall goal difference"
  | "overall goals scored"
  | "team conduct"
  | "fifa ranking";

export interface ThirdPlaceRanking {
  standing: TeamStanding;
  groupId: string;
  /** 1-based rank among the 12 third-placed teams */
  rank: number;
  /** True for the 8 best thirds, who advance to the round of 32 */
  qualifies: boolean;
}

export interface QualificationResult {
  /** Group winners, by group id */
  winners: Record<string, TeamStanding>;
  /** Group runners-up, by group id */
  runnersUp: Record<string, TeamStanding>;
  /** All 12 third-placed teams, ranked; the top 8 have qualifies=true */
  thirdPlaceTable: ThirdPlaceRanking[];
}
