import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Image', description: 'Start with the original rows.' },
    { id: 'swap', label: 'Swap ends', description: 'Swap two ends of a row and invert them.' },
    { id: 'middle', label: 'Middle', description: 'An odd row has one middle cell to invert.' },
    { id: 'done', label: 'Complete', description: 'The flipped and inverted image.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Image (JSON array of 0/1 rows)',
  url: 'https://leetcode.com/problems/flipping-an-image/',
  complexity: 'O(n^2) time and O(1) extra space when the image is changed in place.',
  examples: [
    { label: 'Three by three', input: '[[1,0,0],[0,1,1],[1,0,1]]' },
    { label: 'Two by two', input: '[[0,1],[1,1]]' },
    { label: 'Single cell', input: '[[1]]' },
    { label: 'Equal cells', input: '[[1,1],[1,1]]' },
    { label: 'Largest checkerboard, 20 by 20', input: '[[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]]' },
    { label: 'Long run: 20 by 20 random', input: '[[1,1,1,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,1,1],[0,0,1,1,0,0,0,1,0,0,0,0,1,0,1,1,1,1,0,0],[0,1,1,1,1,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0],[1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0],[0,1,0,1,1,1,1,0,1,1,0,0,0,1,1,0,0,1,0,0],[1,1,0,1,1,0,1,1,1,0,1,0,0,0,1,0,0,1,0,0],[0,0,1,0,0,0,1,0,1,1,1,0,1,0,0,1,1,0,1,0],[0,0,0,0,0,1,1,1,1,0,1,1,0,1,1,0,1,0,1,1],[1,0,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,0,0,1],[0,1,0,0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,1,0],[0,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,0,0,0,1],[0,0,1,1,0,1,0,1,1,1,1,0,1,0,0,1,0,0,0,0],[1,0,0,1,0,1,1,0,1,0,1,1,1,0,1,0,0,0,1,0],[1,1,1,0,1,0,0,1,1,1,1,1,0,0,1,0,0,1,1,1],[0,0,1,0,0,1,1,1,0,0,0,1,1,1,0,1,1,0,1,0],[1,1,0,1,1,0,1,1,1,1,0,0,1,0,1,0,0,0,0,0],[1,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0,1,0,1,1],[0,1,0,1,1,0,0,0,0,1,0,1,0,0,1,0,0,0,1,1],[1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,1,1],[1,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,1,1,1]]' },
  ],
}

export default function FlipImage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Image (current row being flipped)" matrix={step.grid}
      activeCell={step.cells && step.cells.length ? { row: step.row, col: step.cells[0] } : null}
      highlightedCells={(step.cells ?? []).map(c => ({ row: step.row, col: c }))} />
    <p>{`Original rows: ${run.input.map(r => r.join('')).join(' / ')}`}</p>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Reversing and inverting can be done in one pass: swapping the ends while inverting each one gives the same result as the two separate steps.</p>
  </>} />
}
