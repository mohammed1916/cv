import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Tally', description: 'Count the ones in each row and column.' },
    { id: 'cell', label: 'Fill cells', description: 'Combine the four tallies for one cell.' },
    { id: 'done', label: 'Complete', description: 'Every cell holds its difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a 0/1 grid',
  url: 'https://leetcode.com/problems/difference-between-ones-and-zeros-in-row-and-column/',
  complexity: 'O(mn) time: one pass to tally and one pass to fill. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,1,1],[1,0,1],[0,0,1]]}' },
    { label: 'All ones', input: '{"grid":[[1,1,1],[1,1,1]]}' },
  ],
}

export default function OnesMinusZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cross = step.row >= 0 ? [
      ...run.input.grid[0].map((_, c) => ({ row: step.row, col: c })),
      ...run.input.grid.map((_, r) => ({ row: r, col: step.col })),
    ] : []
    return <>
      <MatrixGrid label="Input grid" matrix={run.input.grid} highlightedCells={cross} activeCell={step.row >= 0 ? { row: step.row, col: step.col } : null} />
      <MatrixGrid label="Differences" matrix={step.result} tone="accent" showRowLabels={false} />
      <output aria-label="Cell status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The difference for a cell is the ones in its row plus the ones in its column, minus the zeros in its row and column.</p>
    <p>Each row and column is tallied once, so the cells reuse those four counts instead of recounting.</p>
  </>} />
}
