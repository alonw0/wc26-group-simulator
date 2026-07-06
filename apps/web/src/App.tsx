import type { MatchResult } from "@setecastronomy/wc26-standings-engine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchGroups,
  fetchRealResults,
  simulate,
  type GroupWithFixtures,
  type SimulationResponse,
} from "./api.js";
import { GroupCard } from "./GroupCard.js";
import { QualifiedGrid } from "./QualifiedGrid.js";
import { TheCut } from "./TheCut.js";

/** Scores keyed by group id, then "HOMEID-AWAYID"; empty string = not played yet */
export type Scores = Record<string, Record<string, { home: number | ""; away: number | "" }>>;

const RANDOM_GOALS = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4]; // roughly real scoreline odds

export default function App() {
  const [groups, setGroups] = useState<GroupWithFixtures[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [real, setReal] = useState<Scores | null>(null);
  const [sim, setSim] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchGroups().then(setGroups).catch((e: Error) => setError(e.message));
  }, []);

  const resultsByGroup = useMemo(() => {
    const out: Record<string, MatchResult[]> = {};
    for (const [groupId, matches] of Object.entries(scores)) {
      const complete: MatchResult[] = [];
      for (const [key, s] of Object.entries(matches)) {
        if (s.home === "" || s.away === "") continue;
        const [homeId, awayId] = key.split("-");
        complete.push({ homeId, awayId, homeGoals: s.home, awayGoals: s.away });
      }
      if (complete.length) out[groupId] = complete;
    }
    return out;
  }, [scores]);

  useEffect(() => {
    if (!groups.length) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      simulate(resultsByGroup)
        .then((r) => {
          setSim(r);
          setError(null);
        })
        .catch((e: Error) => setError(e.message));
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [groups, resultsByGroup]);

  const setScore = useCallback(
    (groupId: string, key: string, side: "home" | "away", value: number | "") => {
      setScores((prev) => {
        const current = prev[groupId]?.[key] ?? { home: "" as const, away: "" as const };
        return {
          ...prev,
          [groupId]: {
            ...prev[groupId],
            [key]: { ...current, [side]: value },
          },
        };
      });
    },
    [],
  );

  const loadReal = useCallback(async () => {
    try {
      const { resultsByGroup } = await fetchRealResults();
      const next: Scores = {};
      for (const g of groups) {
        next[g.id] = {};
        for (const r of resultsByGroup[g.id] ?? []) {
          // match the fixture's home/away orientation; swap goals if reversed
          const asPlayed = g.fixtures.some(
            (f) => f.homeId === r.homeId && f.awayId === r.awayId,
          );
          if (asPlayed) {
            next[g.id][`${r.homeId}-${r.awayId}`] = { home: r.homeGoals, away: r.awayGoals };
          } else {
            next[g.id][`${r.awayId}-${r.homeId}`] = { home: r.awayGoals, away: r.homeGoals };
          }
        }
      }
      setScores(next);
      setReal(next);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [groups]);

  const fillRandom = useCallback(() => {
    setScores((prev) => {
      const next: Scores = { ...prev };
      for (const g of groups) {
        next[g.id] = { ...next[g.id] };
        for (const f of g.fixtures) {
          const key = `${f.homeId}-${f.awayId}`;
          const existing = next[g.id][key];
          if (existing && existing.home !== "" && existing.away !== "") continue;
          next[g.id][key] = {
            home: RANDOM_GOALS[Math.floor(Math.random() * RANDOM_GOALS.length)],
            away: RANDOM_GOALS[Math.floor(Math.random() * RANDOM_GOALS.length)],
          };
        }
      }
      return next;
    });
  }, [groups]);

  const clearAll = useCallback(() => {
    setScores({});
    setReal(null);
  }, []);

  const playedCount = Object.values(resultsByGroup).reduce((n, r) => n + r.length, 0);

  const thirdsByGroup = useMemo(() => {
    const map: Record<string, { rank: number; qualifies: boolean }> = {};
    for (const t of sim?.qualification.thirdPlaceTable ?? []) {
      map[t.groupId] = { rank: t.rank, qualifies: t.qualifies };
    }
    return map;
  }, [sim]);

  return (
    <div className="page">
      <header className="masthead">
        <div className="score-bug" aria-live="polite">
          <span className="score-bug-label">Matches</span>
          <span className="score-bug-count">
            {playedCount}
            <em>/72</em>
          </span>
          <span className="score-bug-bar">
            <span style={{ width: `${(playedCount / 72) * 100}%` }} />
          </span>
        </div>
        <p className="masthead-eyebrow">
          <span className="host host-can">🇨🇦 Canada</span>
          <span className="host host-mex">🇲🇽 Mexico</span>
          <span className="host host-usa">🇺🇸 United States</span>
          <span className="host-season">Summer 2026</span>
        </p>
        <h1>
          Group stage,
          <br />
          <span className="masthead-accent">your scores.</span>
        </h1>
        <p className="masthead-sub">
          48 teams, 12 groups, 72 matches. Load the real group stage, then bend history — every
          edit re-runs the official 2026 tiebreakers, head-to-head first, live.
        </p>
        <div className="masthead-actions">
          <button className="btn btn-primary" onClick={loadReal}>
            Load the real group stage
          </button>
          <button className="btn btn-ghost" onClick={fillRandom}>
            Fill remaining at random
          </button>
          <button className="btn btn-ghost" onClick={clearAll} disabled={playedCount === 0}>
            Clear all scores
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        <section className="groups-grid" aria-label="Groups">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              scores={scores[g.id] ?? {}}
              realScores={real?.[g.id]}
              standings={sim?.standingsByGroup[g.id]}
              thirdInfo={thirdsByGroup[g.id]}
              onScore={setScore}
            />
          ))}
        </section>

        {sim && (
          <>
            <TheCut table={sim.qualification.thirdPlaceTable} anyPlayed={playedCount > 0} />
            <QualifiedGrid qualification={sim.qualification} anyPlayed={playedCount > 0} />
          </>
        )}
      </main>

      <footer className="colophon">
        <p>
          Standings computed server-side by{" "}
          <code>@setecastronomy/wc26-standings-engine</code> — published to JFrog Fly by CI on
          every release.
        </p>
      </footer>
    </div>
  );
}
