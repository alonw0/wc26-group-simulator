import fastifyStatic from "@fastify/static";
import {
  computeGroupStandings,
  computeQualification,
  GROUPS,
  groupFixtures,
  type ConductScores,
  type MatchResult,
  type TeamStanding,
} from "@setecastronomy/wc26-standings-engine";
import Fastify from "fastify";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = Fastify({ logger: true });

interface SimulateBody {
  /** Match results keyed by group id, e.g. { "A": [ {homeId, awayId, homeGoals, awayGoals} ] } */
  resultsByGroup: Record<string, MatchResult[]>;
  /** Optional conduct (fair play) scores keyed by group id then team id */
  conductByGroup?: Record<string, ConductScores>;
}

app.get("/healthz", async () => ({
  status: "ok",
  service: "wc26-group-simulator",
  engine: "@setecastronomy/wc26-standings-engine",
}));

app.get("/api/groups", async () => ({
  groups: GROUPS.map((g) => ({ ...g, fixtures: groupFixtures(g) })),
}));

app.post<{ Body: SimulateBody }>("/api/simulate", async (req, reply) => {
  const { resultsByGroup, conductByGroup } = req.body ?? {};
  if (!resultsByGroup || typeof resultsByGroup !== "object") {
    return reply.code(400).send({ error: "Body must include resultsByGroup" });
  }

  const standingsByGroup: Record<string, TeamStanding[]> = {};
  try {
    for (const group of GROUPS) {
      const results = resultsByGroup[group.id] ?? [];
      standingsByGroup[group.id] = computeGroupStandings(
        group,
        results,
        conductByGroup?.[group.id] ?? {},
      );
    }
  } catch (err) {
    return reply.code(400).send({ error: (err as Error).message });
  }

  return {
    standingsByGroup,
    qualification: computeQualification(standingsByGroup),
  };
});

// In the production container the built web bundle sits next to the API
const webDist = join(dirname(fileURLToPath(import.meta.url)), "../../web/dist");
if (existsSync(webDist)) {
  app.register(fastifyStatic, { root: webDist });
  app.setNotFoundHandler((req, reply) => {
    if (req.method === "GET" && !req.url.startsWith("/api")) {
      return reply.sendFile("index.html");
    }
    reply.code(404).send({ error: "Not found" });
  });
}

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
