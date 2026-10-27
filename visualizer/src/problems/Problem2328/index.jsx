import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare to count paths from every cell.' },
    { id: 'visit', label: 'Visit', description: 'Start a count at this cell and look at larger neighbours.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse the path count already stored for this cell.' },
    { id: 'store', label: 'Store', description: 'Save how many paths start at this cell.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of increasing paths.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (1 to 5 rows and columns, values 1 to 9)',
  url: 'https://leetcode.com/problems/number-of-increasing-paths-in-a-grid/',
  complexity: 'O(m * n) cells with memoization, each checking four neighbours. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,1],[3,4]]}' },
    { label: 'Column', input: '{"grid":[[1],[2]]}' },
  ],
}

export default function IncreasingPathsInGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const highlighted = step.memo.map(e => ({ row: e.row, col: e.col }))
    return <>
      <MatrixGrid label="Grid" matrix={run.input.grid} activeCell={step.cell} highlightedCells={highlighted} />
      <table aria-label="Memo table">
        <thead><tr><th>Cell</th><th>Paths starting here</th></tr></thead>
        <tbody>{step.memo.map(e => <tr key={`${e.row},${e.col}`}><td>({e.row}, {e.col})</td><td>{e.value}</td></tr>)}</tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A path may only step to a neighbour with a strictly larger value, so the paths starting at a cell depend only on that cell.</p>
    <p>Each cell's count is stored once. Every cell is also a path by itself, which is why each count starts at one.</p>
  </>} />
}
