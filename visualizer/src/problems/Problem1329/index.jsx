import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Each diagonal is sorted independently.' },
    { id: 'diagonal', label: 'Sort diagonal', description: 'Sort one diagonal and write it back in place.' },
    { id: 'done', label: 'Complete', description: 'Every diagonal is sorted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a mat of positive integers',
  url: 'https://leetcode.com/problems/sort-the-matrix-diagonally/',
  complexity: 'O(mn * min(m, n)) time with insertion sort on each diagonal. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"mat":[[3,3,1,1],[2,2,1,2],[1,1,1,2]]}' },
    { label: 'Single row', input: '{"mat":[[5,2,9]]}' },
  ],
}

export default function SortDiagonally() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label="Matrix" matrix={step.mat} highlightedCells={step.cells.map(([row, col]) => ({ row, col }))} />
    <output aria-label="Diagonal status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Cells on the same diagonal share the same row minus column. Sorting each diagonal separately never moves a value to another diagonal.</p>
    <p>Each diagonal starts in the top row or the left column, so the starts cover every diagonal exactly once.</p>
  </>} />
}
