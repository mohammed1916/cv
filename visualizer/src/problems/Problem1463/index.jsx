import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { minWidth: 36, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: '#1c1917' }

const definition = {
  number: '1463',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid as a JSON array of rows',
  url: 'https://leetcode.com/problems/cherry-pickup-ii/',
  complexity: 'O(rows * cols^2 * 9) time: each row checks every pair of columns against nine previous pairs. O(cols^2) space.',
  examples: [
    { label: 'Two rows', input: '[[1,2],[3,4]]' },
    { label: 'Single row', input: '[[5,6,7]]' },
    { label: 'Three rows', input: '[[1,0,2],[0,3,0],[4,0,5]]' },
  ],
}

export default function CherryPickupII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid } = run.input
    const { row, table, best } = step.snapshot
    return <>
      <table aria-label="Grid" style={{ borderCollapse: 'collapse', marginBottom: 12 }}>
        <tbody>{grid.map((values, r) => <tr key={r}>{values.map((v, c) => <td key={c} style={{ ...cell, background: r === row ? '#fde68a' : 'transparent' }}>{v}</td>)}</tr>)}</tbody>
      </table>
      <table aria-label="Best totals by robot columns" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>a \ b</th>{table.map((_, b) => <th key={b} style={cell}>{b}</th>)}</tr></thead>
        <tbody>{table.map((line, a) => <tr key={a}><th style={cell}>{a}</th>{line.map((v, b) => <td key={b} style={{ ...cell, background: v !== null && v === best ? '#bbf7d0' : 'transparent' }}>{v === null ? '-' : v}</td>)}</tr>)}</tbody>
      </table>
      <p>{`Row ${row} is the current row. Best total: ${best}.`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two robots, one table:</strong> the state is the pair of columns, so each row is one table update.</p>
    <p><strong>Shared cell:</strong> when both robots stand in the same column, its cherries are counted once.</p>
  </>} />
}
