import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No 1 has been seen yet.' },
    { id: 'row', label: 'Row with 1s', description: 'Widen the box to include every 1 in this row.' },
    { id: 'done', label: 'Complete', description: 'Report the box area.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary grid as JSON array of rows (1 to 6 by 1 to 6)',
  url: 'https://leetcode.com/problems/find-the-minimum-area-to-cover-all-ones-i/',
  complexity: 'O(R * C) time over the grid, O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '[[0,1,0],[1,0,1]]' },
    { label: 'Corner', input: '[[1,0],[0,0]]' },
  ],
}

export default function MinimumAreaOnesI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const highlighted = []
    if (step.box) {
      for (let r = step.box.top; r <= step.box.bottom; r++) for (let c = step.box.left; c <= step.box.right; c++) highlighted.push({ row: r, col: c })
    }
    return <>
      <MatrixGrid matrix={run.input} label="Grid with covering box" highlightedCells={highlighted} />
      <output aria-label="Box area">{step.area === null ? 'No 1 seen yet' : `Box area so far: ${step.area}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A single rectangle covers every 1 exactly when it reaches the topmost, bottommost, leftmost and rightmost 1, so only those four extremes matter.</p>
  </>} />
}
