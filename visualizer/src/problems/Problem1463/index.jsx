import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { minWidth: 36, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: 'var(--text)' }

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
    { label: 'One row of equal values', input: '[[7,7]]' },
    { label: 'Equal rows', input: '[[5,5],[5,5]]' },
    { label: 'Largest grid: 10 by 8', input: '[[0,100,0,100,0,100,0,100],[100,0,100,0,100,0,100,0],[0,100,0,100,0,100,0,100],[100,0,100,0,100,0,100,0],[0,100,0,100,0,100,0,100],[100,0,100,0,100,0,100,0],[0,100,0,100,0,100,0,100],[100,0,100,0,100,0,100,0],[0,100,0,100,0,100,0,100],[100,0,100,0,100,0,100,0]]' },
    { label: 'Long run: 10 by 8', input: '[[82,86,14,47,57,52,38,95],[100,41,98,4,91,84,19,98],[87,13,26,97,59,15,92,4],[67,41,74,32,15,8,58,9],[76,48,33,12,20,2,95,23],[51,65,92,7,56,99,30,43],[76,0,44,57,79,22,46,2],[7,14,79,50,66,88,94,14],[8,83,0,5,11,91,11,40],[26,45,45,90,22,41,63,17]]' },
  ],
}

export default function CherryPickupII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid } = run.input
    const { row, table, best } = step.snapshot
    return <>
      <table aria-label="Grid" style={{ borderCollapse: 'collapse', marginBottom: 12 }}>
        <tbody>{grid.map((values, r) => <tr key={r}>{values.map((v, c) => <td key={c} style={{ ...cell, background: r === row ? 'var(--surface2)' : 'transparent' }}>{v}</td>)}</tr>)}</tbody>
      </table>
      <table aria-label="Best totals by robot columns" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>a \ b</th>{table.map((_, b) => <th key={b} style={cell}>{b}</th>)}</tr></thead>
        <tbody>{table.map((line, a) => <tr key={a}><th style={cell}>{a}</th>{line.map((v, b) => <td key={b} style={{ ...cell, background: v !== null && v === best ? 'var(--surface2)' : 'transparent' }}>{v === null ? '-' : v}</td>)}</tr>)}</tbody>
      </table>
      <p>{`Row ${row} is the current row. Best total: ${best}.`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two robots, one table:</strong> the state is the pair of columns, so each row is one table update.</p>
    <p><strong>Shared cell:</strong> when both robots stand in the same column, its cherries are counted once.</p>
  </>} />
}
