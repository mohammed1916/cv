import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan', description: 'Each -1 will take its column maximum.' },
    { id: 'column', label: 'Column maxima', description: 'Find the largest non -1 value in each column.' },
    { id: 'replace', label: 'Replace', description: 'Overwrite each -1 with its column maximum.' },
    { id: 'done', label: 'Complete', description: 'No -1 remains.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a matrix (-1 marks a cell to fill)',
  url: 'https://leetcode.com/problems/modify-the-matrix/',
  complexity: 'O(mn) time and O(m + n) extra space for the column maxima. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"matrix":[[1,2,-1],[4,-1,6],[7,8,9]]}' },
    { label: 'Example 2', input: '{"matrix":[[3,-1],[5,2]]}' },
  ],
}

export default function ModifyMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label="Matrix" matrix={step.matrix} activeCell={step.active && step.active.row >= 0 ? step.active : null}
      highlightedCells={step.active && step.active.row < 0 ? step.matrix.map((_, r) => ({ row: r, col: step.active.col })) : []} />
    <output aria-label="Column status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each column is scanned once to find its largest value that is not -1. Those maxima are then written into the -1 cells of that column.</p>
    <p>The column maximum is taken before any replacement, so replaced values never influence another column's maximum.</p>
  </>} />
}
