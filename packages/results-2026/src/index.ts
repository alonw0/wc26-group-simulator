/**
 * Real FIFA World Cup 2026 group-stage results, June 11–27 2026.
 *
 * This is a versioned DATA package: the major version tracks the matchday
 * (1.x after matchday 1, 2.x after matchday 2, 3.x = group stage complete),
 * so consumers can pin the tournament state they were built against.
 *
 * Team ids match @setecastronomy/wc26-standings-engine's GROUPS data.
 * Source: official results as published on the per-group tournament pages
 * (en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A … _L), retrieved 2026-07-06.
 */

export interface RealMatchResult {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
}

export interface ResultsMeta {
  tournament: "FIFA World Cup 2026";
  stage: "group";
  matchday: 3;
  complete: true;
  retrieved: "2026-07-06";
}

export const REAL_RESULTS_META: ResultsMeta = {
  tournament: "FIFA World Cup 2026",
  stage: "group",
  matchday: 3,
  complete: true,
  retrieved: "2026-07-06",
};

/** All 72 group-stage results, keyed by group id, in played order. */
export const REAL_RESULTS: Record<string, RealMatchResult[]> = {
  A: [
    { homeId: "MEX", awayId: "RSA", homeGoals: 2, awayGoals: 0 },
    { homeId: "KOR", awayId: "CZE", homeGoals: 2, awayGoals: 1 },
    { homeId: "CZE", awayId: "RSA", homeGoals: 1, awayGoals: 1 },
    { homeId: "MEX", awayId: "KOR", homeGoals: 1, awayGoals: 0 },
    { homeId: "CZE", awayId: "MEX", homeGoals: 0, awayGoals: 3 },
    { homeId: "RSA", awayId: "KOR", homeGoals: 1, awayGoals: 0 },
  ],
  B: [
    { homeId: "CAN", awayId: "BIH", homeGoals: 1, awayGoals: 1 },
    { homeId: "QAT", awayId: "SUI", homeGoals: 1, awayGoals: 1 },
    { homeId: "SUI", awayId: "BIH", homeGoals: 4, awayGoals: 1 },
    { homeId: "CAN", awayId: "QAT", homeGoals: 6, awayGoals: 0 },
    { homeId: "SUI", awayId: "CAN", homeGoals: 2, awayGoals: 1 },
    { homeId: "BIH", awayId: "QAT", homeGoals: 3, awayGoals: 1 },
  ],
  C: [
    { homeId: "BRA", awayId: "MAR", homeGoals: 1, awayGoals: 1 },
    { homeId: "HAI", awayId: "SCO", homeGoals: 0, awayGoals: 1 },
    { homeId: "SCO", awayId: "MAR", homeGoals: 0, awayGoals: 1 },
    { homeId: "BRA", awayId: "HAI", homeGoals: 3, awayGoals: 0 },
    { homeId: "SCO", awayId: "BRA", homeGoals: 0, awayGoals: 3 },
    { homeId: "MAR", awayId: "HAI", homeGoals: 4, awayGoals: 2 },
  ],
  D: [
    { homeId: "USA", awayId: "PAR", homeGoals: 4, awayGoals: 1 },
    { homeId: "AUS", awayId: "TUR", homeGoals: 2, awayGoals: 0 },
    { homeId: "USA", awayId: "AUS", homeGoals: 2, awayGoals: 0 },
    { homeId: "TUR", awayId: "PAR", homeGoals: 0, awayGoals: 1 },
    { homeId: "TUR", awayId: "USA", homeGoals: 3, awayGoals: 2 },
    { homeId: "PAR", awayId: "AUS", homeGoals: 0, awayGoals: 0 },
  ],
  E: [
    { homeId: "GER", awayId: "CUW", homeGoals: 7, awayGoals: 1 },
    { homeId: "CIV", awayId: "ECU", homeGoals: 1, awayGoals: 0 },
    { homeId: "GER", awayId: "CIV", homeGoals: 2, awayGoals: 1 },
    { homeId: "ECU", awayId: "CUW", homeGoals: 0, awayGoals: 0 },
    { homeId: "CUW", awayId: "CIV", homeGoals: 0, awayGoals: 2 },
    { homeId: "ECU", awayId: "GER", homeGoals: 2, awayGoals: 1 },
  ],
  F: [
    { homeId: "NED", awayId: "JPN", homeGoals: 2, awayGoals: 2 },
    { homeId: "SWE", awayId: "TUN", homeGoals: 5, awayGoals: 1 },
    { homeId: "NED", awayId: "SWE", homeGoals: 5, awayGoals: 1 },
    { homeId: "TUN", awayId: "JPN", homeGoals: 0, awayGoals: 4 },
    { homeId: "JPN", awayId: "SWE", homeGoals: 1, awayGoals: 1 },
    { homeId: "TUN", awayId: "NED", homeGoals: 1, awayGoals: 3 },
  ],
  G: [
    { homeId: "BEL", awayId: "EGY", homeGoals: 1, awayGoals: 1 },
    { homeId: "IRN", awayId: "NZL", homeGoals: 2, awayGoals: 2 },
    { homeId: "BEL", awayId: "IRN", homeGoals: 0, awayGoals: 0 },
    { homeId: "NZL", awayId: "EGY", homeGoals: 1, awayGoals: 3 },
    { homeId: "EGY", awayId: "IRN", homeGoals: 1, awayGoals: 1 },
    { homeId: "NZL", awayId: "BEL", homeGoals: 1, awayGoals: 5 },
  ],
  H: [
    { homeId: "ESP", awayId: "CPV", homeGoals: 0, awayGoals: 0 },
    { homeId: "KSA", awayId: "URU", homeGoals: 1, awayGoals: 1 },
    { homeId: "ESP", awayId: "KSA", homeGoals: 4, awayGoals: 0 },
    { homeId: "URU", awayId: "CPV", homeGoals: 2, awayGoals: 2 },
    { homeId: "CPV", awayId: "KSA", homeGoals: 0, awayGoals: 0 },
    { homeId: "URU", awayId: "ESP", homeGoals: 0, awayGoals: 1 },
  ],
  I: [
    { homeId: "FRA", awayId: "SEN", homeGoals: 3, awayGoals: 1 },
    { homeId: "IRQ", awayId: "NOR", homeGoals: 1, awayGoals: 4 },
    { homeId: "FRA", awayId: "IRQ", homeGoals: 3, awayGoals: 0 },
    { homeId: "NOR", awayId: "SEN", homeGoals: 3, awayGoals: 2 },
    { homeId: "NOR", awayId: "FRA", homeGoals: 1, awayGoals: 4 },
    { homeId: "SEN", awayId: "IRQ", homeGoals: 5, awayGoals: 0 },
  ],
  J: [
    { homeId: "ARG", awayId: "ALG", homeGoals: 3, awayGoals: 0 },
    { homeId: "AUT", awayId: "JOR", homeGoals: 3, awayGoals: 1 },
    { homeId: "ARG", awayId: "AUT", homeGoals: 2, awayGoals: 0 },
    { homeId: "JOR", awayId: "ALG", homeGoals: 1, awayGoals: 2 },
    { homeId: "ALG", awayId: "AUT", homeGoals: 3, awayGoals: 3 },
    { homeId: "JOR", awayId: "ARG", homeGoals: 1, awayGoals: 3 },
  ],
  K: [
    { homeId: "POR", awayId: "COD", homeGoals: 1, awayGoals: 1 },
    { homeId: "UZB", awayId: "COL", homeGoals: 1, awayGoals: 3 },
    { homeId: "POR", awayId: "UZB", homeGoals: 5, awayGoals: 0 },
    { homeId: "COL", awayId: "COD", homeGoals: 1, awayGoals: 0 },
    { homeId: "COL", awayId: "POR", homeGoals: 0, awayGoals: 0 },
    { homeId: "COD", awayId: "UZB", homeGoals: 3, awayGoals: 1 },
  ],
  L: [
    { homeId: "ENG", awayId: "CRO", homeGoals: 4, awayGoals: 2 },
    { homeId: "GHA", awayId: "PAN", homeGoals: 1, awayGoals: 0 },
    { homeId: "ENG", awayId: "GHA", homeGoals: 0, awayGoals: 0 },
    { homeId: "PAN", awayId: "CRO", homeGoals: 0, awayGoals: 1 },
    { homeId: "PAN", awayId: "ENG", homeGoals: 0, awayGoals: 2 },
    { homeId: "CRO", awayId: "GHA", homeGoals: 2, awayGoals: 1 },
  ],
};
