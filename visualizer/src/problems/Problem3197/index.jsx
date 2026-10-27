import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No split tried yet.' },
    { id: 'split', label: 'Try a split', description: 'Box each of the three parts around its 1s and add the areas.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary grid as JSON array of rows (1 to 6 by 1 to 6, at least three 1s)',
  url: 'https://leetcode.com/problems/find-the-minimum-area-to-cover-all-ones-ii/',
  complexity: 'O(R * C) work per split, O(R^2 * C^2) splits with the direct method. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '[[1,0,1],[1,1,1]]' },
    { label: 'Example 2', input: '[[1,0,1,0],[0,1,0,1]]' },
  ],
}

export default function MinimumAreaOnesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const highlighted = []
    for (const b of step.boxes) for (let r = b.r1; r < b.r2; r++) for (let c = b.c1; c < b.c2; c++) highlighted.push({ row: r, col: c })
    return <>
      <MatrixGrid matrix={run.input} label="Grid with the current three boxes" highlightedCells={highlighted} />
      <output aria-label="Total area">{step.total === null ? 'No split yet' : `Total area: ${step.total}; best ${step.best}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Any three non-overlapping rectangles can be separated by straight cuts, so only the splits into three strips, or a cut followed by a cut on one side, need checking.</p>
    <p>Each part is boxed around its own 1s, which is the smallest rectangle that part can use.</p>
  </>} />
}
