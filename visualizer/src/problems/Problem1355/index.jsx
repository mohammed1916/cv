import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with activities and friends (small sample tables)',
  url: 'https://leetcode.com/problems/activity-participants/',
  complexity: 'One pass to count participants, then one pass to compare each count with the extremes: O(f + a).',
  examples: [
    { label: 'Example', input: '{"activities":[{"id":1,"name":"Chess"},{"id":2,"name":"Tennis"},{"id":3,"name":"Golf"},{"id":4,"name":"Rowing"},{"id":5,"name":"Swim"},{"id":6,"name":"Yoga"}],"friends":[{"id":1,"name":"Ann","activity":1},{"id":2,"name":"Bo","activity":1},{"id":3,"name":"Cy","activity":1},{"id":4,"name":"Di","activity":2},{"id":5,"name":"Ed","activity":2},{"id":6,"name":"Fay","activity":3},{"id":7,"name":"Gus","activity":3},{"id":8,"name":"Hal","activity":3},{"id":9,"name":"Ira","activity":5},{"id":10,"name":"Jo","activity":5},{"id":11,"name":"Kim","activity":6}]}' },
    { label: 'All tied', input: '{"activities":[{"id":1,"name":"Chess"},{"id":2,"name":"Golf"}],"friends":[{"id":1,"name":"Ann","activity":1},{"id":2,"name":"Bo","activity":2}]}' },
  ],
}

function RowTable({ label, rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function ActivityParticipants() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable label="Current rows" rows={step.rows} />
    {step.phase === 'output' && <p>Kept activities: {step.rows.map(r => r.activity).join(', ') || 'none'}</p>}
  </>} renderReasoning={() => <>
    <p>Count the friends in each activity, then find the lowest and highest count.</p>
    <p>Keep an activity only when its count is strictly between those two values, so every tied minimum or maximum is dropped.</p>
  </>} />
}
