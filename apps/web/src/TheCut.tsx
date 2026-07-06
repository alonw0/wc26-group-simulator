import type { ThirdPlaceRanking } from "@setecastronomy/wc26-standings-engine";
import { Fragment } from "react";

interface Props {
  table: ThirdPlaceRanking[];
  anyPlayed: boolean;
}

/**
 * The third-place race: 12 teams, 8 make the round of 32. The red line
 * between #8 and #9 is where group-stage heartbreak lives.
 */
export function TheCut({ table, anyPlayed }: Props) {
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
            <th className="col-team">Team</th>
            <th>Grp</th>
            <th>P</th>
            <th>GD</th>
            <th>GF</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {table.map((t) => (
            <Fragment key={t.standing.team.id}>
              {t.rank === 9 && (
                <tr className="cut-line" aria-label="Qualification cut">
                  <td colSpan={7}>
                    <span>THE CUT — top 8 advance</span>
                  </td>
                </tr>
              )}
              <tr className={t.qualifies ? "row-surviving" : "row-eliminated"}>
                <td className="col-pos">{t.rank}</td>
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
          ))}
        </tbody>
      </table>
    </section>
  );
}
