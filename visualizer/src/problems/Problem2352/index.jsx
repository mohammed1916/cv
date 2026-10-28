import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count columns', description: 'Record how many times each column appears.' },
    { id: 'row', label: 'Match rows', description: 'Look up each row among the recorded columns.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of equal pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a square grid',
  url: 'https://leetcode.com/problems/equal-row-and-column-pairs/',
  complexity: 'O(n^2) time to read the grid and hash each column, plus O(n^2) for the lookups. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[3,2,1],[1,7,6],[2,7,7]]}' },
    { label: 'Example 2', input: '{"grid":[[3,1,2,2],[1,4,4,5],[2,4,2,2],[2,4,2,2]]}' },
  ],
}

export default function EqualRowColumnPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const row = step.row >= 0 ? run.input.grid[step.row].map((_, col) => ({ row: step.row, col })) : []
    return <>
      <MatrixGrid label="Grid" matrix={run.input.grid} highlightedCells={row} activeCell={step.row >= 0 ? { row: step.row, col: 0 } : null} />
      <output aria-label="Pair total">{`Equal pairs so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A row and a column form a pair when they hold the same values in the same order. Storing each column as one key lets every row be matched with a single lookup.</p>
    <p>A column that repeats adds one pair for every matching row, which the count handles directly.</p>
  </>} />
}
