import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read the dated test results.' },
    { id: 'positive', label: 'First positive', description: 'Keep the earliest positive test per patient.' },
    { id: 'check', label: 'Look for negative', description: 'Find a negative test after the positive one.' },
    { id: 'pair', label: 'Pair', description: 'Record the gap in days for this patient.' },
    { id: 'order', label: 'Order', description: 'Sort by gap, then by name.' },
    { id: 'done', label: 'Result', description: 'Report the recovered patients.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with patients and covid_tests lists (knowledge-derived sample)',
  complexity: 'O(T log T) for T tests: sort by date, then one pass per patient. Knowledge-derived draft; the rule is not yet verified against the official statement.',
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

export default function FindCovidRecoveryPatients() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each patient contributes one pair: the earliest positive test and the earliest negative test that follows it.</p>
    <p>Sorting the tests by date first means the first positive is simply the first one we meet.</p>
  </>} />
}
