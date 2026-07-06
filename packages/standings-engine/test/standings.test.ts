import { describe, expect, it } from "vitest";
import { computeGroupStandings } from "../src/standings.js";
import type { Group, MatchResult } from "../src/types.js";

const group: Group = {
  id: "T",
  teams: [
    { id: "AAA", name: "Alpha", flag: "🅰️", fifaRanking: 10 },
    { id: "BBB", name: "Bravo", flag: "🅱️", fifaRanking: 20 },
    { id: "CCC", name: "Charlie", flag: "©️", fifaRanking: 30 },
    { id: "DDD", name: "Delta", flag: "🔺", fifaRanking: 40 },
  ],
};

function positions(standings: ReturnType<typeof computeGroupStandings>): string[] {
  return standings.map((s) => s.team.id);
}

describe("computeGroupStandings — basics", () => {
  it("returns all teams at zero before any result", () => {
    const standings = computeGroupStandings(group, []);
    expect(standings).toHaveLength(4);
    expect(standings.every((s) => s.played === 0 && s.points === 0)).toBe(true);
  });

  it("orders by points when unambiguous", () => {
    const results: MatchResult[] = [
      { homeId: "AAA", awayId: "BBB", homeGoals: 2, awayGoals: 0 },
      { homeId: "CCC", awayId: "DDD", homeGoals: 1, awayGoals: 1 },
    ];
    const standings = computeGroupStandings(group, results);
    expect(positions(standings)).toEqual(["AAA", "CCC", "DDD", "BBB"]);
    expect(standings[0].points).toBe(3);
    expect(standings[0].goalDifference).toBe(2);
  });

  it("computes W/D/L and goal columns mid-group", () => {
    const results: MatchResult[] = [
      { homeId: "AAA", awayId: "BBB", homeGoals: 3, awayGoals: 1 },
      { homeId: "AAA", awayId: "CCC", homeGoals: 0, awayGoals: 0 },
    ];
    const [first] = computeGroupStandings(group, results);
    expect(first.team.id).toBe("AAA");
    expect(first).toMatchObject({ played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, points: 4 });
  });
});

describe("computeGroupStandings — 2026 tiebreakers (head-to-head FIRST)", () => {
  it("ranks the head-to-head winner above a team with far better overall goal difference", () => {
    // AAA and CCC both finish on 6 points. CCC's overall GD is +7, AAA's is -1,
    // but AAA won the head-to-head — under the 2026 rules (unlike 2022's
    // overall-GD-first) AAA must finish top.
    const results: MatchResult[] = [
      { homeId: "AAA", awayId: "CCC", homeGoals: 1, awayGoals: 0 },
      { homeId: "AAA", awayId: "DDD", homeGoals: 1, awayGoals: 0 },
      { homeId: "BBB", awayId: "AAA", homeGoals: 3, awayGoals: 0 },
      { homeId: "CCC", awayId: "BBB", homeGoals: 5, awayGoals: 0 },
      { homeId: "CCC", awayId: "DDD", homeGoals: 3, awayGoals: 0 },
      { homeId: "DDD", awayId: "BBB", homeGoals: 1, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(group, results);
    expect(positions(standings).slice(0, 2)).toEqual(["AAA", "CCC"]);
    expect(standings[0].tiebreaker).toBe("head-to-head points");
    expect(standings[0].goalDifference).toBeLessThan(standings[1].goalDifference);
  });

  it("falls back to overall goal difference when the tied teams drew their mutual match", () => {
    // BBB and CCC: 4 points each, drew 1-1 head-to-head; BBB's win over DDD
    // was by a larger margin, so overall GD separates them.
    const results: MatchResult[] = [
      { homeId: "AAA", awayId: "BBB", homeGoals: 1, awayGoals: 0 },
      { homeId: "AAA", awayId: "CCC", homeGoals: 1, awayGoals: 0 },
      { homeId: "BBB", awayId: "CCC", homeGoals: 1, awayGoals: 1 },
      { homeId: "BBB", awayId: "DDD", homeGoals: 4, awayGoals: 0 },
      { homeId: "CCC", awayId: "DDD", homeGoals: 2, awayGoals: 0 },
      { homeId: "DDD", awayId: "AAA", homeGoals: 2, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(group, results);
    expect(positions(standings)).toEqual(["AAA", "BBB", "CCC", "DDD"]);
    expect(standings[1].tiebreaker).toBe("overall goal difference");
  });

  it("resolves a three-team head-to-head cycle by head-to-head goal difference", () => {
    // AAA→BBB 2-0, BBB→CCC 2-1, CCC→AAA 1-0: all 3 h2h points, but h2h GD
    // differs (AAA +1, BBB -1... AAA: +2/-1=+1, BBB: -2+1=-1, CCC: -1+... CCC: 1-2 & 1-0 → GD 0).
    const results: MatchResult[] = [
      { homeId: "AAA", awayId: "BBB", homeGoals: 2, awayGoals: 0 },
      { homeId: "BBB", awayId: "CCC", homeGoals: 2, awayGoals: 1 },
      { homeId: "CCC", awayId: "AAA", homeGoals: 1, awayGoals: 0 },
      // all three beat DDD so the trio stays level on 6 points
      { homeId: "AAA", awayId: "DDD", homeGoals: 1, awayGoals: 0 },
      { homeId: "BBB", awayId: "DDD", homeGoals: 1, awayGoals: 0 },
      { homeId: "CCC", awayId: "DDD", homeGoals: 1, awayGoals: 0 },
    ];
    const standings = computeGroupStandings(group, results);
    // h2h GD: AAA +1, CCC 0, BBB -1
    expect(positions(standings)).toEqual(["AAA", "CCC", "BBB", "DDD"]);
    expect(standings[0].tiebreaker).toBe("head-to-head goal difference");
  });

  it("uses team conduct, then FIFA ranking, when everything else is level", () => {
    // Perfectly symmetric group: every match drawn 1-1 → all teams identical
    // on points, GD, GF, head-to-head. Conduct separates AAA..CCC; the last
    // two (CCC vs DDD) are level on conduct too, so FIFA ranking decides.
    const results: MatchResult[] = [
      { homeId: "AAA", awayId: "BBB", homeGoals: 1, awayGoals: 1 },
      { homeId: "AAA", awayId: "CCC", homeGoals: 1, awayGoals: 1 },
      { homeId: "AAA", awayId: "DDD", homeGoals: 1, awayGoals: 1 },
      { homeId: "BBB", awayId: "CCC", homeGoals: 1, awayGoals: 1 },
      { homeId: "BBB", awayId: "DDD", homeGoals: 1, awayGoals: 1 },
      { homeId: "CCC", awayId: "DDD", homeGoals: 1, awayGoals: 1 },
    ];
    const standings = computeGroupStandings(group, results, { AAA: -1, BBB: 0, CCC: -3, DDD: -3 });
    expect(positions(standings)).toEqual(["BBB", "AAA", "CCC", "DDD"]);
    expect(standings[1].tiebreaker).toBe("team conduct");
    // CCC (ranking 30) above DDD (ranking 40) purely on FIFA ranking
    expect(standings[2].tiebreaker).toBe("fifa ranking");
  });
});

describe("computeGroupStandings — validation", () => {
  it("rejects results from teams outside the group", () => {
    expect(() =>
      computeGroupStandings(group, [{ homeId: "AAA", awayId: "ZZZ", homeGoals: 1, awayGoals: 0 }]),
    ).toThrow(/does not belong/);
  });

  it("rejects duplicate pairings", () => {
    expect(() =>
      computeGroupStandings(group, [
        { homeId: "AAA", awayId: "BBB", homeGoals: 1, awayGoals: 0 },
        { homeId: "BBB", awayId: "AAA", homeGoals: 2, awayGoals: 2 },
      ]),
    ).toThrow(/Duplicate/);
  });

  it("rejects negative or fractional scores", () => {
    expect(() =>
      computeGroupStandings(group, [{ homeId: "AAA", awayId: "BBB", homeGoals: -1, awayGoals: 0 }]),
    ).toThrow(/Invalid score/);
    expect(() =>
      computeGroupStandings(group, [{ homeId: "AAA", awayId: "BBB", homeGoals: 1.5, awayGoals: 0 }]),
    ).toThrow(/Invalid score/);
  });
});
