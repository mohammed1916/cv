import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Square', description: 'Outline the square that will be flipped.' },
    { id: 'swap', label: 'Swap rows', description: 'Swap mirrored rows inside the square, moving inward.' },
    { id: 'done', label: 'Complete', description: 'Return the updated grid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid, x, y, and k',
  url: 'https://leetcode.com/problems/flip-square-submatrix-vertically/',
  complexity: 'O(k^2) time for the swaps and O(mn) space for the copy. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]],"x":0,"y":0,"k":3}' },
    { label: 'Example 2', input: '{"grid":[[3,4,2,3],[2,3,4,2]],"x":0,"y":2,"k":2}' },
  ],
}

export default function FlipSquareSubmatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { x, y, k } = run.input
    const square = []
    for (let r = x; r < x + k; r++) for (let c = y; c < y + k; c++) square.push({ row: r, col: c })
    return <>
      <MatrixGrid label="Grid after this step" matrix={step.grid} highlightedCells={square}
        activeCell={step.top >= 0 ? { row: step.top, col: y } : null} />
      <output aria-label="Swap status">{step.top >= 0 ? `Swapping rows ${step.top} and ${step.bottom}` : 'Shaded cells form the square'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Flipping a square vertically reverses the order of its rows. Swapping the outermost pair of rows and moving inward performs that reversal in place.</p>
    <p>Only the k columns inside the square move; cells outside it keep their values.</p>
  </>} />
}
