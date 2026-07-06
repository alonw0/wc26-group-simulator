import type { Group } from "../types.js";

/**
 * The real FIFA World Cup 2026 group draw (Washington D.C., December 5, 2025).
 * fifaRanking values are from the final pre-tournament FIFA world ranking
 * (approximate where sources differ) — used only as the last tiebreaker.
 */
export const GROUPS: Group[] = [
  {
    id: "A",
    teams: [
      { id: "MEX", name: "Mexico", flag: "🇲🇽", fifaRanking: 14 },
      { id: "RSA", name: "South Africa", flag: "🇿🇦", fifaRanking: 61 },
      { id: "KOR", name: "Korea Republic", flag: "🇰🇷", fifaRanking: 22 },
      { id: "CZE", name: "Czechia", flag: "🇨🇿", fifaRanking: 44 },
    ],
  },
  {
    id: "B",
    teams: [
      { id: "CAN", name: "Canada", flag: "🇨🇦", fifaRanking: 27 },
      { id: "SUI", name: "Switzerland", flag: "🇨🇭", fifaRanking: 17 },
      { id: "QAT", name: "Qatar", flag: "🇶🇦", fifaRanking: 51 },
      { id: "BIH", name: "Bosnia and Herzegovina", flag: "🇧🇦", fifaRanking: 70 },
    ],
  },
  {
    id: "C",
    teams: [
      { id: "BRA", name: "Brazil", flag: "🇧🇷", fifaRanking: 5 },
      { id: "MAR", name: "Morocco", flag: "🇲🇦", fifaRanking: 11 },
      { id: "HAI", name: "Haiti", flag: "🇭🇹", fifaRanking: 84 },
      { id: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", fifaRanking: 36 },
    ],
  },
  {
    id: "D",
    teams: [
      { id: "USA", name: "United States", flag: "🇺🇸", fifaRanking: 15 },
      { id: "PAR", name: "Paraguay", flag: "🇵🇾", fifaRanking: 39 },
      { id: "AUS", name: "Australia", flag: "🇦🇺", fifaRanking: 26 },
      { id: "TUR", name: "Türkiye", flag: "🇹🇷", fifaRanking: 25 },
    ],
  },
  {
    id: "E",
    teams: [
      { id: "GER", name: "Germany", flag: "🇩🇪", fifaRanking: 9 },
      { id: "CUW", name: "Curaçao", flag: "🇨🇼", fifaRanking: 82 },
      { id: "CIV", name: "Côte d'Ivoire", flag: "🇨🇮", fifaRanking: 42 },
      { id: "ECU", name: "Ecuador", flag: "🇪🇨", fifaRanking: 23 },
    ],
  },
  {
    id: "F",
    teams: [
      { id: "NED", name: "Netherlands", flag: "🇳🇱", fifaRanking: 7 },
      { id: "JPN", name: "Japan", flag: "🇯🇵", fifaRanking: 18 },
      { id: "TUN", name: "Tunisia", flag: "🇹🇳", fifaRanking: 40 },
      { id: "SWE", name: "Sweden", flag: "🇸🇪", fifaRanking: 43 },
    ],
  },
  {
    id: "G",
    teams: [
      { id: "BEL", name: "Belgium", flag: "🇧🇪", fifaRanking: 8 },
      { id: "EGY", name: "Egypt", flag: "🇪🇬", fifaRanking: 34 },
      { id: "IRN", name: "Iran", flag: "🇮🇷", fifaRanking: 21 },
      { id: "NZL", name: "New Zealand", flag: "🇳🇿", fifaRanking: 86 },
    ],
  },
  {
    id: "H",
    teams: [
      { id: "ESP", name: "Spain", flag: "🇪🇸", fifaRanking: 1 },
      { id: "CPV", name: "Cabo Verde", flag: "🇨🇻", fifaRanking: 68 },
      { id: "KSA", name: "Saudi Arabia", flag: "🇸🇦", fifaRanking: 60 },
      { id: "URU", name: "Uruguay", flag: "🇺🇾", fifaRanking: 16 },
    ],
  },
  {
    id: "I",
    teams: [
      { id: "FRA", name: "France", flag: "🇫🇷", fifaRanking: 3 },
      { id: "SEN", name: "Senegal", flag: "🇸🇳", fifaRanking: 19 },
      { id: "NOR", name: "Norway", flag: "🇳🇴", fifaRanking: 29 },
      { id: "IRQ", name: "Iraq", flag: "🇮🇶", fifaRanking: 58 },
    ],
  },
  {
    id: "J",
    teams: [
      { id: "ARG", name: "Argentina", flag: "🇦🇷", fifaRanking: 2 },
      { id: "ALG", name: "Algeria", flag: "🇩🇿", fifaRanking: 35 },
      { id: "AUT", name: "Austria", flag: "🇦🇹", fifaRanking: 24 },
      { id: "JOR", name: "Jordan", flag: "🇯🇴", fifaRanking: 66 },
    ],
  },
  {
    id: "K",
    teams: [
      { id: "POR", name: "Portugal", flag: "🇵🇹", fifaRanking: 6 },
      { id: "UZB", name: "Uzbekistan", flag: "🇺🇿", fifaRanking: 50 },
      { id: "COL", name: "Colombia", flag: "🇨🇴", fifaRanking: 13 },
      { id: "COD", name: "DR Congo", flag: "🇨🇩", fifaRanking: 56 },
    ],
  },
  {
    id: "L",
    teams: [
      { id: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRanking: 4 },
      { id: "CRO", name: "Croatia", flag: "🇭🇷", fifaRanking: 10 },
      { id: "GHA", name: "Ghana", flag: "🇬🇭", fifaRanking: 73 },
      { id: "PAN", name: "Panama", flag: "🇵🇦", fifaRanking: 30 },
    ],
  },
];

/** The six round-robin pairings for a group, in matchday order (1-2, 3-4 | 1-3, 4-2 | 1-4, 2-3). */
export function groupFixtures(group: Group): Array<{ homeId: string; awayId: string }> {
  const [a, b, c, d] = group.teams.map((t) => t.id);
  return [
    { homeId: a, awayId: b },
    { homeId: c, awayId: d },
    { homeId: a, awayId: c },
    { homeId: d, awayId: b },
    { homeId: a, awayId: d },
    { homeId: b, awayId: c },
  ];
}
