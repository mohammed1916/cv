import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1605',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows and cols (JSON)',
  url: 'https://leetcode.com/problems/find-valid-matrix-given-row-and-column-sums/',
  complexity: 'O(m + n) steps and O(m * n) time to fill the grid: each step satisfies a row or a column.',
  examples: [
    { label: 'Sample', input: '{"rows":[5,0,4],"cols":[2,6,1]}' },
    { label: 'Single cell', input: '{"rows":[7],"cols":[7]}' },
    { label: 'Zero row', input: '{"rows":[3,0,2],"cols":[1,4]}' },
  ],
}

export default function FillMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { rowLeft, colLeft, grid, i, j, placed } = step.snapshot
    return <>
      <table aria-label="Grid being filled" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th />{colLeft.map((_, k) => <th key={k}>col {k + 1}</th>)}<th>row left</th></tr></thead>
        <tbody>{grid.map((row, r) => <tr key={r}>
          <th>row {r + 1}</th>
          {row.map((value, k) => <td key={k} style={{
            width: 56, height: 40, textAlign: 'center', border: '1px solid var(--border)',
            background: placed && placed.i === r && placed.j === k ? '#bbf7d0' : 'transparent', color: '#1c1917',
          }}>{value}</td>)}
          <td>{rowLeft[r]}</td>
        </tr>)}</tbody>
        <tfoot><tr><th>col left</th>{colLeft.map((v, k) => <td key={k} style={{ textAlign: 'center' }}>{v}</td>)}</tr></tfoot>
      </table>
      <p>{placed ? `Last placed value: ${placed.v} at (${placed.i + 1}, ${placed.j + 1}).` : 'No value placed in this step.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Smaller demand first:</strong> placing the smaller of the two remaining demands satisfies at least one row or column exactly.</p>
    <p><strong>Totals stay equal:</strong> the remaining row total always equals the remaining column total, so the walk never gets stuck.</p>
  </>} />
}
