import type { QualificationResult } from "@setecastronomy/wc26-standings-engine";

interface Props {
  qualification: QualificationResult;
  anyPlayed: boolean;
}

export function QualifiedGrid({ qualification, anyPlayed }: Props) {
  if (!anyPlayed) return null;
  const { winners, runnersUp, thirdPlaceTable } = qualification;
  const groupIds = Object.keys(winners).sort();
  const bestThirds = thirdPlaceTable.filter((t) => t.qualifies);

  return (
    <section className="qualified-section" aria-label="Round of 32">
      <h2 className="section-title">Round of 32, as it stands</h2>
      <div className="qualified-cols">
        <div>
          <h3 className="qualified-label">Group winners</h3>
          <ul className="chip-list">
            {groupIds.map((g) => (
              <li className="chip chip-winner" key={g}>
                <span className="chip-group">{g}1</span> {winners[g].team.flag}{" "}
                {winners[g].team.id}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="qualified-label">Runners-up</h3>
          <ul className="chip-list">
            {groupIds.map((g) => (
              <li className="chip chip-runnerup" key={g}>
                <span className="chip-group">{g}2</span> {runnersUp[g].team.flag}{" "}
                {runnersUp[g].team.id}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="qualified-label">Best eight thirds</h3>
          <ul className="chip-list">
            {bestThirds.map((t) => (
              <li className="chip chip-third" key={t.standing.team.id}>
                <span className="chip-group">{t.groupId}3</span> {t.standing.team.flag}{" "}
                {t.standing.team.id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
