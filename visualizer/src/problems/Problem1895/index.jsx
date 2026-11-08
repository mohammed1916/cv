import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with the largest possible square size.' },
    { id: 'size', label: 'Size', description: 'Move to the next smaller square size.' },
    { id: 'check', label: 'Test square', description: 'Compare every row, column and diagonal sum of one window.' },
    { id: 'done', label: 'Complete', description: 'Report the largest magic square.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of digits 0 to 9 (JSON)',
  url: 'https://leetcode.com/problems/largest-magic-square/',
  complexity: 'O(min(m, n)^3 * m * n) time with direct sums. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Example', input: '{"grid":[[7,1,4,5,6],[2,5,1,6,4],[1,5,4,3,2],[1,2,7,3,4]]}' },
    { label: 'Small', input: '{"grid":[[1,2],[3,4]]}' },
  { label: 'Single cell', input: "{\"grid\":[[3]]}" },
  { label: 'All equal values', input: "{\"grid\":[[2,2],[2,2]]}" },
  { label: 'Five by five, extremes', input: "{\"grid\":[[9,0,9,0,9],[0,9,0,9,0],[9,0,9,0,9],[0,9,0,9,0],[9,0,9,0,9]]}" },
  { label: 'Long run: five by five', input: "{\"grid\":[[1,1,1,9,6],[2,6,8,8,3],[7,9,1,7,5],[2,7,2,7,6],[3,4,5,3,2]]}" },
  ],
}

export default function LargestMagicSquare() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const highlighted = []
    if (step.top >= 0) for (let r = step.top; r < step.top + step.side; r++) for (let c = step.left; c < step.left + step.side; c++) highlighted.push({ row: r, col: c })
    return <>
      <MatrixGrid matrix={run.input.grid} label="Grid (window under test highlighted)" highlightedCells={highlighted} cellWidth={44} cellHeight={40} />
      <IndexedSequence label="Line sums of the window (rows, columns, diagonals)" length={step.sums.length} active={-1} valueAt={i => step.sums[i]} roleAt={() => (step.ok === false ? 'differs' : '')} />
      <output aria-label="Size">{`Side under test: ${step.side || '-'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A square is magic when all of its row sums, column sums and both diagonal sums are equal. The first square found at the largest size is the answer.</p>
  </>} />
}
