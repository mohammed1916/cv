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
    { label: 'Break', input: '[[3,4,5],[9,3,6],[1,9,3]]' }, { label: 'Single row', input: '[[1,2,3,4,5,6,7,8]]' }, { label: 'Equal values', input: '[[9,9],[9,9]]' }, { label: 'Largest Toeplitz 8 by 8', input: '[[50,57,64,71,78,85,92,99],[43,50,57,64,71,78,85,92],[36,43,50,57,64,71,78,85],[29,36,43,50,57,64,71,78],[22,29,36,43,50,57,64,71],[15,22,29,36,43,50,57,64],[8,15,22,29,36,43,50,57],[1,8,15,22,29,36,43,50]]' }, { label: 'Long run: random 8 by 8', input: '[[26,84,93,77,9,39,47,15],[14,97,14,35,28,53,4,59],[77,68,77,8,47,10,35,38],[39,79,96,73,40,74,1,56],[68,81,74,84,89,57,46,29],[76,57,3,90,96,68,19,57],[51,97,62,0,95,29,54,43],[21,47,97,16,60,1,84,93]]' },
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
