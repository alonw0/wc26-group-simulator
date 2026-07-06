# ⚽ WC26 Group Stage Simulator

**Pick every score of the 2026 World Cup group stage and watch the official tiebreakers reorder the tables live** — including the rule most fans don't know yet: in 2026, head-to-head results now beat overall goal difference, and 8 of the 12 third-placed teams survive "The Cut" into a round of 32.

Built as a real-world demo of shipping artifacts with **[JFrog Fly](https://jfrog.com/fly/)**: every push to `main` builds the app, runs the tests, pushes the Docker image to the Fly container registry, and publishes the standings engine as an npm package to the Fly npm registry.

![CI](https://github.com/alonw0/wc26-group-simulator/actions/workflows/ci.yml/badge.svg)

## What's inside

```
packages/standings-engine   @setecastronomy/wc26-standings-engine — the npm package
                            Official 2026 tiebreakers (head-to-head first, recursively
                            re-applied), third-place ranking, round-of-32 qualification.
                            Zero dependencies, fully unit-tested.
apps/api                    Fastify backend. Wraps the engine in a small REST API and
                            serves the web bundle in production.
apps/web                    React + Vite frontend. Group cards, live standings,
                            "The Cut" third-place race, round-of-32 grid.
Dockerfile                  Multi-stage build → single ~177MB runtime image.
```

The engine is the point of the npm story: it's a genuinely reusable library (a fantasy-league backend or a Slack bot could `npm install` it from the Fly registry), not a package invented to satisfy a pipeline.

## Run it locally

With Docker (recommended — this is the image CI ships to Fly):

```bash
docker compose up --build
# open http://localhost:3000
```

Or directly with Node ≥ 20:

```bash
npm ci
npm run build
node apps/api/dist/server.js       # serves API + built frontend on :3000
```

Dev mode (API with reload + Vite dev server with proxy):

```bash
npm run dev:api    # terminal 1 → :3000
npm run dev:web    # terminal 2 → :5173
```

Tests:

```bash
npm test
```

## API

| Route | What it does |
|---|---|
| `GET /api/groups` | The real December 2025 draw: 12 groups, 48 teams, fixtures |
| `POST /api/simulate` | Body: `{ resultsByGroup }` → standings per group + full qualification picture |
| `GET /healthz` | Liveness |

## How the CI workflow works

On every push to `main`, GitHub Actions:

1. **Authenticates to JFrog Fly with OIDC** — `jfrog/fly-action@v1` exchanges the workflow's GitHub identity token for a Fly access token and auto-configures npm and Docker for the Fly registry. No long-lived secrets stored in the repo.
2. **Builds and tests** — TypeScript build of all three workspaces plus the vitest suite (the same tests also run inside the Docker build, so an image can't ship untested code).
3. **Pushes the Docker image** to the Fly container registry, tagged with the version and commit SHA.
4. **Publishes the npm package** — `@setecastronomy/wc26-standings-engine` goes to the Fly npm registry, versioned per run.

Pull requests run build + tests only; artifacts are published from `main`.

A note on the lockfile: `package-lock.json` is resolved against the public npm registry so anyone can clone and build this repo without Fly credentials. In CI, `fly-action` points npm at the Fly registry and npm transparently substitutes the registry host — dependencies are proxied (and cached) through Fly without rewriting the lockfile.

## The 2026 rules, since you'll ask

When teams finish level on points, 2026 breaks ties **head-to-head first** (points, then goal difference, then goals scored, among the tied teams only — re-applied recursively to any subset still tied), and only then overall goal difference, overall goals, team conduct score, and FIFA ranking. This is a change from 2022, which used overall goal difference first. The third-place table (points → GD → goals → conduct → FIFA ranking) decides which 8 of the 12 third-placed teams advance.
