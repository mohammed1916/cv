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
    { label: 'Corner-offset window', input: '{"grid":[[4,9,1],[2,7,6],[8,3,5]],"x":1,"y":0,"k":2}' },
    { label: 'Single cell', input: '{"grid":[[5]],"x":0,"y":0,"k":1}' },
    { label: 'Equal cells', input: '{"grid":[[2,2],[2,2]],"x":0,"y":1,"k":1}' },
    { label: 'Largest grid and values', input: '{"grid":[[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100]],"x":0,"y":0,"k":8}' },
    { label: 'Long run: 8 by 8 grid', input: '{"grid":[[19,11,10,84,89,6,25,6],[6,35,21,60,71,90,7,82],[99,52,58,60,98,52,38,63],[28,30,56,2,38,23,22,1],[2,30,38,92,67,43,12,80],[26,50,10,16,24,88,2,44],[74,15,27,92,35,69,25,81],[76,78,88,14,27,28,45,19]],"x":2,"y":4,"k":3}' },
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
