import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--primary-contrast)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read the inventory rows.' },
    { id: 'average', label: 'Average', description: 'Find the store average price.' },
    { id: 'split', label: 'Split', description: 'Add up stock above and below the average.' },
    { id: 'keep', label: 'Imbalanced', description: 'Above-average stock is smaller than below-average stock.' },
    { id: 'skip', label: 'Skip', description: 'Fewer than two products, or balanced stock.' },
    { id: 'order', label: 'Order', description: 'Sort by store name.' },
    { id: 'done', label: 'Result', description: 'Report the imbalanced stores.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with stores and inventory rows',
  complexity: 'O(I + S log S) for I inventory rows and S stores.',
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

export default function FindStoresWithInventoryImbalance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each store is compared with its own average price, so cheap and expensive products are judged within one shop.</p>
    <p>Products priced exactly at the average are left out of both totals.</p>
  </>} />
}
