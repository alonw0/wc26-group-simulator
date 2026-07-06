import type {
  ConductScores,
  Group,
  MatchResult,
  Team,
  TeamStanding,
  TiebreakerKind,
} from "./types.js";

interface Stats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function emptyStats(): Stats {
  return { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

function computeStats(teamIds: Set<string>, results: MatchResult[]): Map<string, Stats> {
  const stats = new Map<string, Stats>();
  for (const id of teamIds) stats.set(id, emptyStats());
  for (const r of results) {
    if (!teamIds.has(r.homeId) || !teamIds.has(r.awayId)) continue;
    const home = stats.get(r.homeId)!;
    const away = stats.get(r.awayId)!;
    home.played++;
    away.played++;
    home.goalsFor += r.homeGoals;
    home.goalsAgainst += r.awayGoals;
    away.goalsFor += r.awayGoals;
    away.goalsAgainst += r.homeGoals;
    if (r.homeGoals > r.awayGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (r.homeGoals < r.awayGoals) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }
  return stats;
}

interface RankedTeam {
  team: Team;
  tiebreaker?: TiebreakerKind;
}

/**
 * Order a set of teams that are level on points, per the official 2026 criteria:
 * head-to-head points → head-to-head GD → head-to-head goals scored among the
 * tied teams; if a subset remains tied, the same criteria are re-applied to that
 * subset alone; only when head-to-head is fully inconclusive do overall goal
 * difference, overall goals, team conduct, and FIFA ranking decide.
 */
function rankTiedCluster(
  tied: Team[],
  results: MatchResult[],
  overall: Map<string, Stats>,
  conduct: ConductScores,
): RankedTeam[] {
  if (tied.length === 1) return [{ team: tied[0] }];

  const tiedIds = new Set(tied.map((t) => t.id));
  const h2h = computeStats(tiedIds, results);
  const h2hKey = (t: Team): [number, number, number] => {
    const o = overall.get(t.id)!;
    // 2022-style: overall goal difference and goals decide before head-to-head
    return [o.goalsFor - o.goalsAgainst, o.goalsFor, h2h.get(t.id)!.points];
  };

  const sorted = [...tied].sort((a, b) => {
    const ka = h2hKey(a);
    const kb = h2hKey(b);
    for (let i = 0; i < 3; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  });

  // Partition into sub-clusters that share an identical head-to-head key
  const partitions: Team[][] = [];
  for (const t of sorted) {
    const last = partitions[partitions.length - 1];
    if (last && h2hKey(last[0]).join() === h2hKey(t).join()) last.push(t);
    else partitions.push([t]);
  }

  // Head-to-head fully inconclusive → overall criteria decide
  if (partitions.length === 1) {
    return rankByOverall(tied, overall, conduct);
  }

  const ranked: RankedTeam[] = [];
  for (let p = 0; p < partitions.length; p++) {
    // Re-apply the criteria exclusively to the still-tied subset
    const subRanked = rankTiedCluster(partitions[p], results, overall, conduct);
    ranked.push(...subRanked);
    // Annotate the boundary between this partition and the next
    if (p < partitions.length - 1) {
      const above = ranked[ranked.length - 1];
      const below = partitions[p + 1][0];
      const ka = h2hKey(partitions[p][0]);
      const kb = h2hKey(below);
      const kinds: TiebreakerKind[] = [
        "head-to-head points",
        "head-to-head goal difference",
        "head-to-head goals scored",
      ];
      for (let i = 0; i < 3; i++) {
        if (ka[i] !== kb[i]) {
          above.tiebreaker ??= kinds[i];
          break;
        }
      }
    }
  }
  return ranked;
}

function rankByOverall(
  tied: Team[],
  overall: Map<string, Stats>,
  conduct: ConductScores,
): RankedTeam[] {
  const key = (t: Team): [number, number, number, number] => {
    const s = overall.get(t.id)!;
    // FIFA ranking negated so that "higher is better" holds for every component
    return [s.goalsFor - s.goalsAgainst, s.goalsFor, conduct[t.id] ?? 0, -t.fifaRanking];
  };
  const kinds: TiebreakerKind[] = [
    "overall goal difference",
    "overall goals scored",
    "team conduct",
    "fifa ranking",
  ];
  const sorted = [...tied].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < 4; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  });
  const ranked: RankedTeam[] = sorted.map((team) => ({ team }));
  for (let i = 0; i < ranked.length - 1; i++) {
    const ka = key(ranked[i].team);
    const kb = key(ranked[i + 1].team);
    for (let j = 0; j < 4; j++) {
      if (ka[j] !== kb[j]) {
        ranked[i].tiebreaker ??= kinds[j];
        break;
      }
    }
  }
  return ranked;
}

function validate(group: Group, results: MatchResult[]): void {
  const ids = new Set(group.teams.map((t) => t.id));
  const seen = new Set<string>();
  for (const r of results) {
    if (!ids.has(r.homeId) || !ids.has(r.awayId)) {
      throw new Error(`Result ${r.homeId} vs ${r.awayId} does not belong to group ${group.id}`);
    }
    if (r.homeId === r.awayId) {
      throw new Error(`A team cannot play itself: ${r.homeId}`);
    }
    if (
      !Number.isInteger(r.homeGoals) ||
      !Number.isInteger(r.awayGoals) ||
      r.homeGoals < 0 ||
      r.awayGoals < 0
    ) {
      throw new Error(`Invalid score ${r.homeGoals}-${r.awayGoals} for ${r.homeId} vs ${r.awayId}`);
    }
    const pairing = [r.homeId, r.awayId].sort().join("-");
    if (seen.has(pairing)) {
      throw new Error(`Duplicate result for pairing ${pairing} in group ${group.id}`);
    }
    seen.add(pairing);
  }
}

/**
 * Compute the standings of one group under the official 2026 World Cup rules.
 * Accepts 0–6 results, so standings can be computed mid-group.
 */
export function computeGroupStandings(
  group: Group,
  results: MatchResult[],
  conduct: ConductScores = {},
): TeamStanding[] {
  validate(group, results);

  const ids = new Set(group.teams.map((t) => t.id));
  const overall = computeStats(ids, results);

  // Sort by points, then resolve each cluster of point-level teams
  const byPoints = [...group.teams].sort(
    (a, b) => overall.get(b.id)!.points - overall.get(a.id)!.points,
  );
  const clusters: Team[][] = [];
  for (const t of byPoints) {
    const last = clusters[clusters.length - 1];
    if (last && overall.get(last[0].id)!.points === overall.get(t.id)!.points) last.push(t);
    else clusters.push([t]);
  }

  const ordered: RankedTeam[] = clusters.flatMap((cluster) =>
    rankTiedCluster(cluster, results, overall, conduct),
  );

  return ordered.map((r, i) => {
    const s = overall.get(r.team.id)!;
    return {
      team: r.team,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      points: s.points,
      conduct: conduct[r.team.id] ?? 0,
      position: i + 1,
      tiebreaker: r.tiebreaker,
    };
  });
}
