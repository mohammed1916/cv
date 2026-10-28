import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan', description: 'Every full 3 by 3 block gives one hourglass.' },
    { id: 'scan', label: 'Scan hourglasses', description: 'Add the seven cells of each hourglass.' },
    { id: 'done', label: 'Complete', description: 'Report the largest hourglass sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a grid of non-negative integers',
  url: 'https://leetcode.com/problems/maximum-sum-of-an-hourglass/',
  complexity: 'O(mn) hourglasses with 7 additions each. The visualization caps the grid at 7 by 7.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[6,2,1,3],[4,2,1,5],[9,2,8,7],[4,1,2,9]]}' },
    { label: 'Example 2', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]]}' },
  ],
}

export default function MaxHourglassSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const center = step.at ? { row: step.at[0] + 1, col: step.at[1] + 1 } : null
    return <>
      <MatrixGrid label="Grid" matrix={run.input.grid} highlightedCells={step.cells.map(([row, col]) => ({ row, col }))} activeCell={center} />
      <output aria-label="Hourglass sum">{`Current sum: ${step.sum}${step.best !== null ? `, best: ${step.best}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>An hourglass is a 3 by 3 block without its two middle-row corners. Summing all nine cells and subtracting those two corners gives the same total.</p>
    <p>Checking each top-left position once covers every hourglass that fits in the grid.</p>
  </>} />
}
