import {
  computeGroupStandings,
  computeQualification,
  GROUPS,
  type TeamStanding,
} from "@setecastronomy/wc26-standings-engine";
import { describe, expect, it } from "vitest";
import { REAL_RESULTS, REAL_RESULTS_META } from "../src/index.js";

describe("dataset shape", () => {
  it("covers all 12 groups with 6 matches each (72 total)", () => {
    expect(Object.keys(REAL_RESULTS).sort()).toEqual("ABCDEFGHIJKL".split(""));
    const total = Object.values(REAL_RESULTS).reduce((n, r) => n + r.length, 0);
    expect(total).toBe(72);
  });

  it("gives every team exactly 3 matches, all pairings unique", () => {
    for (const group of GROUPS) {
      const results = REAL_RESULTS[group.id];
      const counts = new Map<string, number>();
      const pairings = new Set<string>();
      for (const r of results) {
        counts.set(r.homeId, (counts.get(r.homeId) ?? 0) + 1);
        counts.set(r.awayId, (counts.get(r.awayId) ?? 0) + 1);
        pairings.add([r.homeId, r.awayId].sort().join("-"));
      }
      expect(pairings.size).toBe(6);
      for (const team of group.teams) expect(counts.get(team.id)).toBe(3);
    }
  });

  it("is marked as the complete group stage", () => {
    expect(REAL_RESULTS_META.matchday).toBe(3);
    expect(REAL_RESULTS_META.complete).toBe(true);
  });
});

describe("cross-check against the real tournament", () => {
  const standingsByGroup: Record<string, TeamStanding[]> = {};
  for (const group of GROUPS) {
    standingsByGroup[group.id] = computeGroupStandings(group, REAL_RESULTS[group.id]);
  }
  const q = computeQualification(standingsByGroup);

  it("reproduces the real group winners", () => {
    const winners = Object.fromEntries(
      Object.entries(q.winners).map(([g, s]) => [g, s.team.id]),
    );
    expect(winners).toEqual({
      A: "MEX", B: "SUI", C: "BRA", D: "USA", E: "GER", F: "NED",
      G: "BEL", H: "ESP", I: "FRA", J: "ARG", K: "COL", L: "ENG",
    });
  });

  it("reproduces the real runners-up", () => {
    const runnersUp = Object.fromEntries(
      Object.entries(q.runnersUp).map(([g, s]) => [g, s.team.id]),
    );
    expect(runnersUp).toEqual({
      A: "RSA", B: "CAN", C: "MAR", D: "AUS", E: "CIV", F: "JPN",
      G: "EGY", H: "CPV", I: "NOR", J: "AUT", K: "POR", L: "CRO",
    });
  });

  it("reproduces the real 8 qualified third-placed teams", () => {
    const qualified = q.thirdPlaceTable
      .filter((t) => t.qualifies)
      .map((t) => t.standing.team.id)
      .sort();
    expect(qualified).toEqual(
      ["BIH", "PAR", "ECU", "SWE", "SEN", "ALG", "COD", "GHA"].sort(),
    );
  });

  it("reproduces the documented points totals", () => {
    // spot-check the headline numbers from the official tables
    const pts = (g: string, id: string) =>
      standingsByGroup[g].find((s) => s.team.id === id)!.points;
    expect(pts("A", "MEX")).toBe(9);
    expect(pts("C", "BRA")).toBe(7);
    expect(pts("C", "MAR")).toBe(7);
    expect(pts("H", "CPV")).toBe(3); // three draws, still through as runner-up
    expect(pts("I", "FRA")).toBe(9);
    expect(pts("J", "ARG")).toBe(9);
  });
});
