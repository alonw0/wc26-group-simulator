import type { QualificationResult, TeamStanding, ThirdPlaceRanking } from "./types.js";

/**
 * Rank the 12 third-placed teams and mark the 8 best, per the official 2026
 * criteria: points → goal difference → goals scored → team conduct → FIFA
 * ranking. Head-to-head never applies here — thirds come from different groups.
 */
export function rankThirdPlacedTeams(
  standingsByGroup: Record<string, TeamStanding[]>,
): ThirdPlaceRanking[] {
  const thirds = Object.entries(standingsByGroup)
    .map(([groupId, standings]) => ({
      groupId,
      standing: standings.find((s) => s.position === 3),
    }))
    .filter((t): t is { groupId: string; standing: TeamStanding } => t.standing !== undefined);

  const key = (s: TeamStanding): [number, number, number, number, number] => [
    s.points,
    s.goalDifference,
    s.goalsFor,
    s.conduct,
    -s.team.fifaRanking,
  ];

  thirds.sort((a, b) => {
    const ka = key(a.standing);
    const kb = key(b.standing);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  });

  return thirds.map((t, i) => ({
    ...t,
    rank: i + 1,
    qualifies: i < 8,
  }));
}

/**
 * Full round-of-32 qualification picture: 12 winners + 12 runners-up + the 8
 * best third-placed teams.
 */
export function computeQualification(
  standingsByGroup: Record<string, TeamStanding[]>,
): QualificationResult {
  const winners: Record<string, TeamStanding> = {};
  const runnersUp: Record<string, TeamStanding> = {};
  for (const [groupId, standings] of Object.entries(standingsByGroup)) {
    const first = standings.find((s) => s.position === 1);
    const second = standings.find((s) => s.position === 2);
    if (first) winners[groupId] = first;
    if (second) runnersUp[groupId] = second;
  }
  return {
    winners,
    runnersUp,
    thirdPlaceTable: rankThirdPlacedTeams(standingsByGroup),
  };
}
