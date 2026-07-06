# ⚽ WC26 Group Stage Simulator

**Load the real 2026 group stage — all 72 actual results — then bend history.** Iran went home unbeaten this summer; Senegal advanced after losing twice. That's the new third-place math: 12 third-placed teams, 8 survive "The Cut," and when teams finish level, head-to-head now beats overall goal difference — a 2026 rule change most codebases would get wrong.

This repo keeps that bug on purpose: the [`demo/2022-rules`](https://github.com/alonw0/wc26-group-simulator/tree/demo/2022-rules) branch ranks by the old rules — and produces *identical* output on the real results. The broken code path simply never ran this summer; one different scoreline exposes it (three tests already know), and `main` holds the four-line fix. What stands between them is the interesting part: a **[JFrog Fly](https://jfrog.com/fly/)** pipeline where every push builds, tests, and produces *one release* containing the Docker image, the standings engine (npm), and the real results as a versioned data package — versioned together, no stored secrets, no release ritual. The fix ships because someone merged it.

![CI](https://github.com/alonw0/wc26-group-simulator/actions/workflows/ci.yml/badge.svg)

## What's inside

```
packages/standings-engine   @setecastronomy/wc26-standings-engine — the rules as code.
                            Official 2026 tiebreakers (head-to-head first, recursively
                            re-applied), third-place ranking, round-of-32 qualification.
                            Zero dependencies, fully unit-tested.
packages/results-2026       @setecastronomy/wc26-results — the real tournament as data.
                            All 72 actual group-stage results, published as a versioned
                            package (major version = matchday; 3.x = groups complete).
                            Its test suite feeds the real results through the engine and
                            asserts the outputs match the real qualified 24.
apps/api                    Fastify backend. Wraps both packages in a small REST API and
                            serves the web bundle in production.
apps/web                    React + Vite frontend. Load the real group stage, then bend
                            history — edited fixtures glow gold, standings re-rank live,
                            "The Cut" shows who you just sent home.
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
| `GET /api/results` | The real group-stage results (all 72), served from `@setecastronomy/wc26-results` |
| `POST /api/simulate` | Body: `{ resultsByGroup }` → standings per group + full qualification picture |
| `GET /healthz` | Liveness |

## How the CI workflow works

On every push to `main`, GitHub Actions:

1. **Authenticates to JFrog Fly with OIDC** — `jfrog/fly-action@v1` exchanges the workflow's GitHub identity token for a Fly access token and auto-configures npm and Docker for the Fly registry. No long-lived secrets stored in the repo.
2. **Builds and tests** — TypeScript build of all three workspaces plus the vitest suite (the same tests also run inside the Docker build, so an image can't ship untested code).
3. **Pushes the Docker image** to the Fly container registry, tagged with the version and commit SHA.
4. **Publishes both npm packages** — the engine (`0.1.<run>`) and the results data package (`3.0.<run>` — major version tracks the matchday) go to the Fly npm registry. Data ships as releases too: during the group stage this package would have been republished after every matchday, each one traceable.

Pull requests run build + tests only; artifacts are published from `main`.

Fly ties both artifacts to the CI run as one **release** — image and package are versioned together (`0.1.<run>`), so "what shipped" is a single answer, not two registries to cross-reference.

## Consume the artifacts from Fly

With access to the `setecastronomy` Fly tenant (JFrog Fly Desktop handles auth):

```bash
# The image CI built (note: built on ubuntu runners → linux/amd64)
docker pull setecastronomy.jfrog.io/docker/wc26-group-simulator:latest
docker run --rm -p 3000:3000 setecastronomy.jfrog.io/docker/wc26-group-simulator:latest

# The engine, in your own project
npm install @setecastronomy/wc26-standings-engine
```

A note on the lockfile: `package-lock.json` is resolved against the public npm registry so anyone can clone and build this repo without Fly credentials. In CI, `fly-action` points npm at the Fly registry and npm transparently substitutes the registry host — dependencies are proxied (and cached) through Fly without rewriting the lockfile.

## Pipeline design choices

The choices below are deliberate — this section exists because "the pipeline works" and "the flow makes sense" are different claims.

- **Release on every merge to `main`, docs included.** Three of this repo's releases are README-only changes, and that's a choice: with releasing this cheap (no ritual, auto-titled, auto-grouped), the release *history* becomes the filter, not the pipeline. The alternative — path filters or tag-triggered releases — trades away "every commit on main is shipped and traceable." For a library with external consumers I'd flip to tags; for a continuously-delivered app, every-merge wins.
- **`0.1.<run>` versioning instead of semver.** Versions here encode *traceability*, not compatibility: any artifact version maps 1:1 to the CI run that produced it, and the image + both packages always share a run. Semver earns its keep when strangers depend on your public API; until then, run-linked versions answer the question teams actually ask ("what produced this?"). Re-runs of a failed workflow get a `-rerun.N` suffix so a retry can never collide with an already-published immutable version.
- **PRs build and test; only `main` publishes.** The boring, correct gate. Artifacts from unreviewed code never reach the registry.
- **Tests run twice — on the runner and inside the Docker build.** The second run means an image *cannot exist* with failing tests, even if someone builds it outside CI.
- **Single-arch image (`linux/amd64`).** A demo-scope tradeoff, made knowingly: multi-arch via `buildx` is one step more and ~2× the build time; it's the first thing to add if anyone runs this on ARM in production (on an Apple Silicon laptop it runs under emulation).
- **Serialized publishes, cancelable PR runs.** A `concurrency` group keeps racing merges from interleaving pushes, while stale PR runs cancel to save minutes.

## The 2026 rules, since you'll ask

When teams finish level on points, 2026 breaks ties **head-to-head first** (points, then goal difference, then goals scored, among the tied teams only — re-applied recursively to any subset still tied), and only then overall goal difference, overall goals, team conduct score, and FIFA ranking. This is a change from 2022, which used overall goal difference first. The third-place table (points → GD → goals → conduct → FIFA ranking) decides which 8 of the 12 third-placed teams advance.
