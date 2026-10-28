import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Patterns', description: 'Each row is a pattern to compare.' },
    { id: 'row', label: 'Compare row', description: 'Count the rows equal to this row or to its complement.' },
    { id: 'done', label: 'Complete', description: 'Report the largest group.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix of 0 and 1 as a JSON array of rows',
  url: 'https://leetcode.com/problems/flip-columns-for-maximum-number-of-equal-rows/',
  complexity: 'O(m^2 * n) time for an m by n matrix. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '[[0,1],[1,1]]' },
    { label: 'Example 2', input: '[[0,1],[1,0]]' },
    { label: 'Example 3', input: '[[0,0,0],[0,0,1],[1,1,0]]' },
  ],
}

export default function FlipColumnsEqualRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cells = step.matched.flatMap(r => run.input[r].map((_, col) => ({ row: r, col })))
    return <>
      <MatrixGrid matrix={run.input} label="Matrix" highlightedCells={cells} />
      <output aria-label="Best group">{`Largest group so far: ${step.best} row${step.best === 1 ? '' : 's'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Flipping a column changes it for every row, so the rows that can be made all equal together are exactly those equal to one row or to its complement.</p>
    <p>Trying each row as the pattern to match covers every possible flip choice.</p>
  </>} />
}
