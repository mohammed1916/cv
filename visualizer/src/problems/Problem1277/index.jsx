import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1277',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a matrix of 0 and 1 rows (JSON)',
  url: 'https://leetcode.com/problems/count-square-submatrices-with-all-ones/',
  complexity: 'O(rows x cols) time and space: each cell is computed once from three earlier neighbours.',
  examples: [
    { label: 'Small block', input: '{"matrix":[[0,1],[1,1]]}' },
    { label: 'Two by three', input: '{"matrix":[[1,1,1],[1,1,1]]}' },
    { label: 'Single one', input: '{"matrix":[[1]]}' },
    { label: 'Single zero', input: '{"matrix":[[0]]}' },
    { label: 'All zeros', input: '{"matrix":[[0,0],[0,0]]}' },
    { label: 'Largest grid, all ones', input: '{"matrix":[[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]]}' },
    { label: 'Long run: 8 by 8 random', input: '{"matrix":[[1,0,0,1,1,1,0,0],[1,0,1,1,0,1,1,1],[1,0,1,1,1,0,1,1],[0,0,1,0,0,0,1,1],[1,0,1,0,0,1,1,1],[0,0,0,0,1,1,1,0],[1,0,0,0,1,0,1,0],[0,0,1,1,0,0,0,0]]}' },
  ],
}

export default function SquareSubmatrices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { dp, i, j, total, value, up, left, diag } = step.snapshot
    return <>
      <table aria-label="Dynamic programming table" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>{dp.map((row, r) => <tr key={r}>{row.map((cell, c) => {
          const current = i === r && j === c
          return <td key={c} style={{
            width: 44, height: 40, textAlign: 'center', border: `${current ? 2 : 1}px solid ${current ? 'var(--text)' : 'var(--border)'}`,
            background: current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'transparent', color: 'var(--text)',
          }}>{run.input.matrix[r][c]}{cell ? ` → ${cell}` : ''}</td>
        })}</tr>)}</tbody>
      </table>
      {up !== undefined && <p>Neighbours at ({i}, {j}): up {up}, left {left}, diagonal {diag}</p>}
      {total !== undefined && <p>Running total: {total}</p>}
      {value === 0 && <p>This cell is 0, so no square ends here.</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Square corner idea:</strong> a square with bottom-right corner at a cell exists in size k only if the three neighbours above, left and diagonal support size k-1.</p>
    <p><strong>Counting:</strong> the table value at a cell is the number of squares ending there, so summing the table counts every square once.</p>
  </>} />
}
