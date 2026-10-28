import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Teams', description: 'Start with every team at zero in every place.' },
    { id: 'tally', label: 'Tally ballot', description: 'Add each ballot to the count for the team in each place.' },
    { id: 'rank', label: 'Rank', description: 'Sort by first-place count, then second place, and so on, then alphabetically.' },
    { id: 'done', label: 'Complete', description: 'Report the ranking as one string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with votes (ballots of equal length)',
  url: 'https://leetcode.com/problems/rank-teams-by-votes/',
  complexity: 'O(v * t + t log t * t) time for v ballots of t teams, with the place counts stored per team.',
  examples: [
    { label: 'Example 1', input: '{"votes":["ABC","ACB","ABC","ACB","ACB"]}' },
    { label: 'Example 2', input: '{"votes":["WXYZ","XYZW"]}' },
  ],
}

export default function RankTeamsByVotes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const teams = Object.keys(step.counts)
    const places = teams.length ? step.counts[teams[0]].length : 0
    return <>
      <table aria-label="Place counts">
        <thead><tr><th>Team</th>{Array.from({ length: places }, (_, p) => <th key={p}>Place {p + 1}</th>)}</tr></thead>
        <tbody>{teams.map(t => <tr key={t}><td>{t}</td>{step.counts[t].map((c, p) => <td key={p}>{c}</td>)}</tr>)}</tbody>
      </table>
      <output aria-label="Ranking so far">{step.order.length ? `Ranking: ${step.order.join(' ')}` : 'Ranking: not yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each team carries a vector of place counts. Comparing vectors from the first place onward decides the order.</p>
    <p>Alphabetical order is only the final tie-break.</p>
  </>} />
}
