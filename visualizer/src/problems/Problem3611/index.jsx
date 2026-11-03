import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every meeting.' },
    { id: 'compare', label: 'Compare', description: 'Check one pair of meetings for overlap.' },
    { id: 'count', label: 'Count', description: 'Total the overlapping pairs for one employee.' },
    { id: 'flag', label: 'Overbooked', description: 'The count reaches the threshold.' },
    { id: 'skip', label: 'Below', description: 'The count stays under the threshold.' },
    { id: 'order', label: 'Order', description: 'Sort by overlaps, then by name.' },
    { id: 'done', label: 'Result', description: 'Report the overbooked employees.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with employees, meetings and a threshold (knowledge-derived sample)',
  complexity: 'O(M^2) pair checks per employee with M meetings. Knowledge-derived draft; the overlap and threshold rules are not yet verified against the official statement.',
  examples: [{ label: 'Sample', input: SAMPLE_TEXT }],
}

const cell = { border: '1px solid currentColor', padding: '4px 8px' }

function Rows({ columns = [], rows = [] }) {
  if (rows.length === 0) return <p>No rows yet.</p>
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(c => <th key={c} style={cell}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c} style={cell}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindOverbookedEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two meetings overlap when each starts before the other ends. Every pair is checked once.</p>
    <p>Touching meetings, where one ends exactly when the next starts, do not count as overlapping.</p>
  </>} />
}
