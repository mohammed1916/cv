import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare an empty answer grid.' },
    { id: 'cell', label: 'Cell', description: 'Compare the distinct values on the two diagonals through this cell.' },
    { id: 'done', label: 'Complete', description: 'Every cell holds its gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a grid of integers',
  url: 'https://leetcode.com/problems/difference-of-number-of-distinct-values-on-diagonals/',
  complexity: 'O(mn * min(m, n)) time from walking each diagonal. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2,3],[3,1,5],[3,2,1]]}' },
    { label: 'Single cell', input: '{"grid":[[1]]}' },
  ],
}

export default function DiagonalDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const above = step.above ? step.above.map(([row, col]) => ({ row, col })) : []
    const below = step.below ? step.below.map(([row, col]) => ({ row, col })) : []
    return <>
      <MatrixGrid label="Grid" matrix={run.input.grid} highlightedCells={[...above, ...below]}
        activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} />
      <MatrixGrid label="Gap per cell" matrix={step.answer} tone="accent" showRowLabels={false} />
      <output aria-label="Cell status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each cell looks at two diagonals: the cells above-left of it and the cells below-right. Only distinct values count, so repeats on a diagonal add nothing.</p>
    <p>The answer for each cell is the absolute difference between those two distinct counts.</p>
  </>} />
}
