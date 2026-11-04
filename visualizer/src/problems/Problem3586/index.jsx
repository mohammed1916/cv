import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

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
  inputLabel: 'Object with patients and covid_tests lists',
  complexity: 'O(T log T) for T tests: sort by date, then one pass per patient.',
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
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each patient contributes one pair: the earliest positive test and the earliest negative test that follows it.</p>
    <p>Sorting the tests by date first means the first positive is simply the first one we meet.</p>
  </>} />
}
