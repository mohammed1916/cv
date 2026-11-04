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
    { id: 'load', label: 'Load', description: 'Read every study session.' },
    { id: 'mark', label: 'Mark repeats', description: 'Compare each session with the one three steps earlier.' },
    { id: 'keep', label: 'Spiral', description: 'The longest repeat run reaches the minimum length.' },
    { id: 'skip', label: 'Short', description: 'The longest repeat run is too short.' },
    { id: 'order', label: 'Order', description: 'Sort by spiral length, then by student.' },
    { id: 'done', label: 'Result', description: 'Report the students with a spiral.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sessions and min_length',
  complexity: 'O(S log S) for S sessions: sort by student and date, then one pass per student.',
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
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A session is a repeat when its subject matches the one three sessions earlier. A run of repeats extends the pattern.</p>
    <p>The spiral length counts the three opening sessions plus the repeats in the longest run.</p>
  </>} />
}
