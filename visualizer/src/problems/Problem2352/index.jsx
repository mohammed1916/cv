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
    { label: 'One cell', input: '{"grid":[[7]]}' },
    { label: 'Uniform grid', input: '{"grid":[[2,2],[2,2]]}' },
    { label: 'Largest grid, 6 by 6', input: '{"grid":[[1,12,23,34,45,56],[8,19,30,41,52,63],[15,26,37,48,59,70],[22,33,44,55,66,77],[29,40,51,62,73,84],[36,47,58,69,80,91]]}' },
    { label: 'Long run: 6 by 6 small values', input: '{"grid":[[1,2,1,3,3,1],[1,2,1,3,3,2],[1,2,1,3,3,1],[2,2,3,1,3,3],[1,2,2,3,1,1],[2,3,1,2,2,3]]}' },
  ],
}

export default function EqualRowColumnPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const row = step.row >= 0 ? run.input.grid[step.row].map((_, col) => ({ row: step.row, col })) : []
    return <>
      <MatrixGrid label="Grid" matrix={run.input.grid} highlightedCells={row} activeCell={step.row >= 0 ? { row: step.row, col: 0 } : null} />
      <p>{step.row >= 0 ? `Pointer r = row ${step.row}` : 'Pointer r waits for the first row.'}</p>
      <output aria-label="Pair total">{`Equal pairs so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A row and a column form a pair when they hold the same values in the same order. Storing each column as one key lets every row be matched with a single lookup.</p>
    <p>A column that repeats adds one pair for every matching row, which the count handles directly.</p>
  </>} />
}
