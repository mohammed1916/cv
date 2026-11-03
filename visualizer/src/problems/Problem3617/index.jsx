import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every study session.' },
    { id: 'mark', label: 'Mark repeats', description: 'Compare each session with the one three steps earlier.' },
    { id: 'keep', label: 'Spiral', description: 'The longest repeat run reaches the minimum length.' },
    { id: 'skip', label: 'Short', description: 'The longest repeat run is too short.' },
    { id: 'order', label: 'Order', description: 'Sort by spiral length, then by student.' },
    { id: 'done', label: 'Result', description: 'Report the students with a spiral.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sessions and min_length (knowledge-derived sample)',
  complexity: 'O(S log S) for S sessions: sort by student and date, then one pass per student. Knowledge-derived draft; the spiral rule is not yet verified against the official statement.',
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

export default function FindStudentsWithStudySpiralPattern() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A session is a repeat when its subject matches the one three sessions earlier. A run of repeats extends the pattern.</p>
    <p>The spiral length counts the three opening sessions plus the repeats in the longest run.</p>
  </>} />
}
