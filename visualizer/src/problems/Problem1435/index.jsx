import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Sessions', description: 'Read the session durations, measured in seconds.' },
  { id: 'match', label: 'Bin', description: 'Place each session in the bin that covers its duration.' },
  { id: 'output', label: 'Count', description: 'Count the sessions in each bin, empty bins included.' },
  { id: 'done', label: 'Result', description: 'Return the four bins in order.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  number: '1435', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Sessions list of { session_id, duration } rows; duration is in seconds',
  url: 'https://leetcode.com/problems/create-a-session-bar-chart/',
  complexity: 'O(n * b) for n sessions and b = 4 bins in this visualization; a sorted-bin sweep is O(n log n).',
  examples: [
    { label: 'Example', input: '{"Sessions":[{"session_id":1,"duration":100},{"session_id":2,"duration":400},{"session_id":3,"duration":1000},{"session_id":4,"duration":299},{"session_id":5,"duration":900}]}' },
    { label: 'Boundaries', input: '{"Sessions":[{"session_id":1,"duration":299},{"session_id":2,"duration":300},{"session_id":3,"duration":899},{"session_id":4,"duration":900}]}' },
  ],
}

export default function CreateSessionBarChart() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>A duration in seconds is compared with fixed bin edges. Each bin includes its lower edge and excludes its upper edge, so 300 seconds starts the second bin and 900 seconds starts the 15 or more bin.</p>
  </>} />
}
