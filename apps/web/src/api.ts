import type {
  Group,
  MatchResult,
  QualificationResult,
  TeamStanding,
} from "@setecastronomy/wc26-standings-engine";

export interface GroupWithFixtures extends Group {
  fixtures: Array<{ homeId: string; awayId: string }>;
}

export interface SimulationResponse {
  standingsByGroup: Record<string, TeamStanding[]>;
  qualification: QualificationResult;
}

export async function fetchGroups(): Promise<GroupWithFixtures[]> {
  const res = await fetch("/api/groups");
  if (!res.ok) throw new Error(`Loading groups failed (${res.status})`);
  const body = (await res.json()) as { groups: GroupWithFixtures[] };
  return body.groups;
}

export interface RealResultsResponse {
  meta: { matchday: number; complete: boolean; retrieved: string };
  resultsByGroup: Record<string, MatchResult[]>;
}

export async function fetchRealResults(): Promise<RealResultsResponse> {
  const res = await fetch("/api/results");
  if (!res.ok) throw new Error(`Loading real results failed (${res.status})`);
  return (await res.json()) as RealResultsResponse;
}

export async function simulate(
  resultsByGroup: Record<string, MatchResult[]>,
): Promise<SimulationResponse> {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ resultsByGroup }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Simulation failed (${res.status})`);
  }
  return (await res.json()) as SimulationResponse;
}
