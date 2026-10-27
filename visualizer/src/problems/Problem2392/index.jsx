import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Grid', description: 'Start with an empty k by k grid.' },
    { id: 'graph', label: 'Conditions', description: 'Read the row and column conditions.' },
    { id: 'rows', label: 'Row order', description: 'Topologically sort the values for the rows.' },
    { id: 'cols', label: 'Column order', description: 'Topologically sort the values for the columns.' },
    { id: 'place', label: 'Place', description: 'Put each value at its row and column.' },
    { id: 'fail', label: 'Cycle', description: 'A cycle means no matrix can satisfy the conditions.' },
    { id: 'done', label: 'Complete', description: 'Report the matrix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k, row_conditions and col_conditions (JSON)',
  url: 'https://leetcode.com/problems/build-a-matrix-with-conditions/',
  complexity: 'O(k^2 + conditions) time with two topological sorts. The visualization caps k at 6.',
  examples: [
    { label: 'Example 1', input: '{"k":3,"row_conditions":[[1,2],[3,2]],"col_conditions":[[2,1],[3,2]]}' },
    { label: 'Cycle', input: '{"k":3,"row_conditions":[[1,2],[2,3],[3,1]],"col_conditions":[[2,1]]}' },
  ],
}

export default function BuildMatrixWithConditions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Row order" length={step.rows.length} valueAt={i => step.rows[i]} active={step.phase === 'rows' ? step.rows.length - 1 : -1} />
    <IndexedSequence label="Column order" length={step.cols.length} valueAt={i => step.cols[i]} active={step.phase === 'cols' ? step.cols.length - 1 : -1} />
    <table aria-label="Matrix">
      <tbody>{step.grid.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j}>{v || '·'}</td>)}</tr>)}</tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Row conditions only involve the row positions, and column conditions only involve the column positions. Each value gets its row from one order and its column from the other.</p>
    <p>If either set of conditions forms a cycle, no ordering exists and the answer is empty.</p>
  </>} />
}
