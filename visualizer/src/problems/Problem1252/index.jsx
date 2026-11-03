import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1252',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix size and increment pairs (JSON)',
  url: 'https://leetcode.com/problems/cells-with-odd-values-in-a-matrix/',
  complexity: 'O(q + m * n) time for q operations on an m by n matrix, and O(m + n) space for the two counter arrays.',
  examples: [
    { label: 'Mixed', input: '{"m":3,"n":4,"indices":[[0,1],[2,3],[2,0]]}' },
    { label: 'Same cell twice', input: '{"m":2,"n":2,"indices":[[1,1],[1,1]]}' },
    { label: 'Single cell', input: '{"m":1,"n":1,"indices":[[0,0]]}' },
  ],
}

export default function CellsWithOddValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { rows, cols, scanRow } = step.snapshot
    return <>
      <table aria-label="Parity grid" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>row \ col</th>{cols.map((cv, c) => <th key={c}>c{c}: {cv}</th>)}</tr></thead>
        <tbody>{rows.map((rv, r) => <tr key={r}><th>r{r}: {rv}</th>{cols.map((cv, c) => {
          const odd = (rv + cv) % 2 === 1
          return <td key={c} data-cell={`${r},${c}`} style={{
            width: 56, height: 36, textAlign: 'center', border: '1px solid var(--border)',
            background: odd ? '#fde68a' : 'transparent', color: '#1c1917',
            outline: scanRow === r ? '2px solid var(--text)' : 'none',
          }}>{rv + cv}</td>
        })}</tr>)}</tbody>
      </table>
      <p>Highlighted cells are odd. Row counters: {rows.join(', ')}. Column counters: {cols.join(', ')}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Parity shortcut:</strong> an operation adds one to a whole row or column, so every cell's value is the row counter plus the column counter. The matrix itself never has to be built.</p>
    <p><strong>Odd sums:</strong> the sum of two integers is odd exactly when their parities differ, so only the counters' parity matters.</p>
  </>} />
}
