import type { ThirdPlaceRanking } from "@setecastronomy/wc26-standings-engine";
import { Fragment, useEffect, useRef } from "react";
import { useFlip } from "./useFlip.js";

interface Props {
  table: ThirdPlaceRanking[];
  anyPlayed: boolean;
}

/**
 * The third-place race: 12 teams, 8 make the round of 32. The red line
 * between #8 and #9 is where group-stage heartbreak lives. Rows carry
 * broadcast-style ▲/▼ markers showing movement since the last score change.
 */
export function TheCut({ table, anyPlayed }: Props) {
  const flipRef = useFlip();
  const prevRanks = useRef(new Map<string, number>());

  const deltas = new Map<string, number>();
  for (const t of table) {
    const prev = prevRanks.current.get(t.standing.team.id);
    if (prev !== undefined && anyPlayed) deltas.set(t.standing.team.id, prev - t.rank);
  }

  useEffect(() => {
    if (!anyPlayed) {
      prevRanks.current.clear();
      return;
    }
    for (const t of table) prevRanks.current.set(t.standing.team.id, t.rank);
  }, [table, anyPlayed]);

  return (
    <section className="cut-section" aria-label="Third-place race">
      <h2 className="section-title">The third-place race</h2>
      <p className="section-sub">
        {anyPlayed
          ? "Eight of the twelve third-placed teams survive. Everything below the line goes home."
          : "No scores yet — the race is ranked by FIFA world ranking until matches are played."}
      </p>
      <table className="cut-table">
        <thead>
          <tr>
            <th>#</th>
            <th aria-label="Movement"></th>
            <th className="col-team">Team</th>
            <th>Grp</th>
            <th>P</th>
            <th>GD</th>
            <th>GF</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {table.map((t) => {
            const delta = deltas.get(t.standing.team.id) ?? 0;
            return (
              <Fragment key={t.standing.team.id}>
                {t.rank === 9 && (
                  <tr className="cut-line" aria-label="Qualification cut">
                    <td colSpan={8}>
                      <span>The cut — top 8 advance</span>
                    </td>
                  </tr>
                )}
                <tr
                  ref={flipRef(t.standing.team.id)}
                  className={t.qualifies ? "row-surviving" : "row-eliminated"}
                >
                  <td className="col-pos">{t.rank}</td>
                  <td className="col-move">
                    {delta > 0 && <span className="move-up">▲{delta}</span>}
                    {delta < 0 && <span className="move-down">▼{-delta}</span>}
                  </td>
                  <td className="col-team">
                    {t.standing.team.flag} {t.standing.team.name}
                  </td>
                  <td>{t.groupId}</td>
                  <td>{t.standing.played}</td>
                  <td>
                    {t.standing.goalDifference > 0
                      ? `+${t.standing.goalDifference}`
                      : t.standing.goalDifference}
                  </td>
                  <td>{t.standing.goalsFor}</td>
                  <td className="col-pts">{t.standing.points}</td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
