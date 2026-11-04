import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every reaction row.' },
    { id: 'group', label: 'Group', description: 'Count each user reactions and the most common one.' },
    { id: 'filter', label: 'Filter', description: 'Keep users with five items and a 60 percent share.' },
    { id: 'order', label: 'Order', description: 'Sort by ratio, then by user.' },
    { id: 'done', label: 'Result', description: 'Report the rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a reactions list of user_id, content_id and reaction',
  url: 'https://leetcode.com/problems/find-emotionally-consistent-users/',
  complexity: 'O(r) to count r reaction rows, plus a sort of the kept users.',
  examples: [{ label: 'Sample', input: sampleText }],
}

function CurrentTable({ table }) {
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.length
        ? table.rows.map((row, index) => <tr key={index}>{table.columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={table.columns.length}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

export default function FindEmotionallyConsistentUsers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>Count how many times each user used each reaction, then the total and the largest count.</p>
    <p>A user stays only when the total is at least five and the largest count is at least three fifths of the total, which also rules out a tie for the dominant reaction.</p>
  </>} />
}
