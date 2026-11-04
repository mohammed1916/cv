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
    { id: 'load', label: 'Load', description: 'Read the trips and the split date.' },
    { id: 'periods', label: 'Periods', description: 'Total distance and fuel for each period.' },
    { id: 'compare', label: 'Gain', description: 'Late efficiency beats early efficiency.' },
    { id: 'skip', label: 'Skip', description: 'Missing period or no gain.' },
    { id: 'order', label: 'Order', description: 'Sort by gain, then by name.' },
    { id: 'done', label: 'Result', description: 'Report the improved drivers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with drivers, trips and an ISO split date',
  complexity: 'O(T + D log D) for T trips and D drivers.',
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

export default function FindDriversWithImprovedFuelEfficiency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Efficiency for a period is total kilometres divided by total litres, so long trips weigh more than short ones.</p>
    <p>A driver is listed only when both periods have trips and the late efficiency is higher.</p>
  </>} />
}
