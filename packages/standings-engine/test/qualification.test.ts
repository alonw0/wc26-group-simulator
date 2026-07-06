import { describe, expect, it } from "vitest";
import { GROUPS, groupFixtures } from "../src/data/groups.js";
import { computeQualification, rankThirdPlacedTeams } from "../src/qualification.js";
import { computeGroupStandings } from "../src/standings.js";
import type { MatchResult, TeamStanding } from "../src/types.js";

/** Simulate every group with deterministic scores: seeded team wins by predictable margins. */
function simulateAllGroups(): Record<string, TeamStanding[]> {
  const standingsByGroup: Record<string, TeamStanding[]> = {};
  for (const group of GROUPS) {
    const order = new Map(group.teams.map((t, i) => [t.id, i]));
    const results: MatchResult[] = groupFixtures(group).map(({ homeId, awayId }) => {
      const hi = order.get(homeId)!;
      const ai = order.get(awayId)!;
      // earlier draw position wins by the seeding gap; ties impossible in a group
      return hi < ai
        ? { homeId, awayId, homeGoals: ai - hi, awayGoals: 0 }
        : { homeId, awayId, homeGoals: 0, awayGoals: hi - ai };
    });
    standingsByGroup[group.id] = computeGroupStandings(group, results);
  }
  return standingsByGroup;
}

describe("computeQualification", () => {
  it("produces 12 winners, 12 runners-up, and exactly 8 qualifying thirds", () => {
    const q = computeQualification(simulateAllGroups());
    expect(Object.keys(q.winners)).toHaveLength(12);
    expect(Object.keys(q.runnersUp)).toHaveLength(12);
    expect(q.thirdPlaceTable).toHaveLength(12);
    expect(q.thirdPlaceTable.filter((t) => t.qualifies)).toHaveLength(8);
    // the table is ranked
    expect(q.thirdPlaceTable.map((t) => t.rank)).toEqual([...Array(12)].map((_, i) => i + 1));
  });

  it("handles partial tournaments (only some groups simulated)", () => {
    const all = simulateAllGroups();
    const partial = { A: all.A, B: all.B };
    const q = computeQualification(partial);
    expect(Object.keys(q.winners)).toHaveLength(2);
    expect(q.thirdPlaceTable).toHaveLength(2);
    expect(q.thirdPlaceTable.every((t) => t.qualifies)).toBe(true);
  });
});

describe("rankThirdPlacedTeams", () => {
  function third(
    id: string,
    groupId: string,
    points: number,
    gd: number,
    gf: number,
    conduct = 0,
    fifaRanking = 50,
  ): [string, TeamStanding[]] {
    const standing: TeamStanding = {
      team: { id, name: id, flag: "🏳️", fifaRanking },
      played: 3,
      won: 1,
      drawn: 0,
      lost: 2,
      goalsFor: gf,
      goalsAgainst: gf - gd,
      goalDifference: gd,
      points,
      conduct,
      position: 3,
    };
    return [groupId, [standing]];
  }

  it("ranks by points, then GD, then goals, then conduct, then FIFA ranking", () => {
    const standingsByGroup = Object.fromEntries([
      third("PTS", "A", 6, 0, 2),
      third("GDF", "B", 4, 3, 3),
      third("GLS", "C", 4, 1, 5),
      third("GL2", "D", 4, 1, 2),
      third("CND", "E", 3, 0, 2, -1, 60),
      third("RNK", "F", 3, 0, 2, -2, 12),
      third("RN2", "G", 3, 0, 2, -2, 55),
    ]);
    const table = rankThirdPlacedTeams(standingsByGroup);
    expect(table.map((t) => t.standing.team.id)).toEqual([
      "PTS", // most points
      "GDF", // best GD among the 4-point teams
      "GLS", // same GD as GL2, more goals
      "GL2",
      "CND", // best conduct among the 3-point teams
      "RNK", // conduct tied with RN2, better FIFA ranking
      "RN2",
    ]);
  });
});
