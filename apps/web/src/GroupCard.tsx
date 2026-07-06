import type { TeamStanding, TiebreakerKind } from "@setecastronomy/wc26-standings-engine";
import type { GroupWithFixtures } from "./api.js";
import type { Scores } from "./App.js";

const TIEBREAK_SHORT: Record<TiebreakerKind, string> = {
  "head-to-head points": "H2H",
  "head-to-head goal difference": "H2H GD",
  "head-to-head goals scored": "H2H GF",
  "overall goal difference": "GD",
  "overall goals scored": "GF",
  "team conduct": "FAIR PLAY",
  "fifa ranking": "FIFA RANK",
};

interface Props {
  group: GroupWithFixtures;
  scores: Scores[string];
  standings?: TeamStanding[];
  thirdInfo?: { rank: number; qualifies: boolean };
  onScore: (groupId: string, key: string, side: "home" | "away", value: number | "") => void;
}

export function GroupCard({ group, scores, standings, thirdInfo, onScore }: Props) {
  const teamById = new Map(group.teams.map((t) => [t.id, t]));

  const parse = (raw: string): number | "" => {
    if (raw === "") return "";
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 && n <= 20 ? n : "";
  };

  const rowClass = (s: TeamStanding): string => {
    if (s.position <= 2) return "row-through";
    if (s.position === 3 && thirdInfo?.qualifies && s.played > 0) return "row-third-in";
    return "";
  };

  return (
    <article className="group-card">
      <h2 className="group-card-title">Group {group.id}</h2>

      <ul className="fixtures">
        {group.fixtures.map((f) => {
          const key = `${f.homeId}-${f.awayId}`;
          const s = scores[key] ?? { home: "", away: "" };
          const home = teamById.get(f.homeId)!;
          const away = teamById.get(f.awayId)!;
          return (
            <li className="fixture" key={key}>
              <span className="fixture-team fixture-home">
                {home.flag} <b>{home.id}</b>
              </span>
              <input
                className="score-input"
                type="number"
                min={0}
                max={20}
                inputMode="numeric"
                aria-label={`${home.name} goals against ${away.name}`}
                value={s.home}
                onChange={(e) => onScore(group.id, key, "home", parse(e.target.value))}
              />
              <span className="fixture-dash">–</span>
              <input
                className="score-input"
                type="number"
                min={0}
                max={20}
                inputMode="numeric"
                aria-label={`${away.name} goals against ${home.name}`}
                value={s.away}
                onChange={(e) => onScore(group.id, key, "away", parse(e.target.value))}
              />
              <span className="fixture-team fixture-away">
                <b>{away.id}</b> {away.flag}
              </span>
            </li>
          );
        })}
      </ul>

      {standings && (
        <table className="standings">
          <thead>
            <tr>
              <th aria-label="Position"></th>
              <th className="col-team">Team</th>
              <th>P</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.team.id} className={rowClass(s)}>
                <td className="col-pos">{s.position}</td>
                <td className="col-team">
                  {s.team.flag} {s.team.id}
                  {s.tiebreaker && s.played > 0 && (
                    <span className="tiebreak-chip" title={`Separated by ${s.tiebreaker}`}>
                      {TIEBREAK_SHORT[s.tiebreaker]}
                    </span>
                  )}
                  {s.position === 3 && thirdInfo && s.played > 0 && (
                    <span
                      className={`third-chip ${thirdInfo.qualifies ? "third-in" : "third-out"}`}
                      title={`Ranked #${thirdInfo.rank} of the third-placed teams`}
                    >
                      3rd · #{thirdInfo.rank}
                    </span>
                  )}
                </td>
                <td>{s.played}</td>
                <td>{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                <td className="col-pts">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
