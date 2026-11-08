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
    { label: 'Own: three by four grid', input: '{"grid":[[5,1,0,3],[2,8,6,1],[4,4,0,9]]}' },
    { label: 'Own: shuffled three by three', input: '{"grid":[[0,9,4],[2,7,1],[6,3,5]]}' },
    { label: 'Smallest grid', input: '{"grid":[[0,0,0],[0,0,0],[0,0,0]]}' },
    { label: 'Equal values', input: '{"grid":[[5,5,5],[5,5,5],[5,5,5]]}' },
    { label: 'Largest values', input: '{"grid":[[100,0,100],[0,100,0],[100,0,100]]}' },
    { label: 'Long run: 7 by 7', input: '{"grid":[[24,35,40,97,26,19,90],[71,10,73,44,61,69,6],[28,31,68,50,27,84,92],[72,47,42,74,14,95,10],[6,73,77,28,5,70,0],[15,48,27,30,83,20,26],[8,40,40,88,73,44,45]]}' },
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
