import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Diagonals', description: 'Every diagonal must stay constant.' },
    { id: 'check', label: 'Compare', description: 'Each cell matches its upper-left neighbour.' },
    { id: 'fail', label: 'Mismatch', description: 'This diagonal changes, so the matrix fails.' },
    { id: 'done', label: 'Complete', description: 'All diagonals are constant.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix (JSON array of rows)',
  url: 'https://leetcode.com/problems/toeplitz-matrix/',
  complexity: 'O(m * n) time and O(1) extra space.',
  examples: [
    { label: 'Diagonal', input: '[[7,1,2],[7,7,1],[7,7,7]]' },
    { label: 'Break', input: '[[3,4,5],[9,3,6],[1,9,3]]' },
  ],
}

export default function ToeplitzMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Matrix (compared pair highlighted)" matrix={run.input}
      activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null}
      highlightedCells={step.pair ? step.pair.map(([row, col]) => ({ row, col })) : []} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A Toeplitz matrix has constant diagonals going down and to the right. Checking each cell against its upper-left neighbour covers every diagonal, because each diagonal is a chain of such pairs.</p>
  </>} />
}
