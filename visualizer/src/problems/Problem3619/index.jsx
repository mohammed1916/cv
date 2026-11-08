import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Walk the grid in row order looking for an unseen non-zero cell.' },
    { id: 'flood', label: 'Flood fill', description: 'Explore the island from its first cell and add up its values.' },
    { id: 'count', label: 'Divisible', description: 'The island total is divisible by k, so it is counted.' },
    { id: 'reject', label: 'Not divisible', description: 'The island total is not divisible by k, so it is not counted.' },
    { id: 'done', label: 'Complete', description: 'Report how many islands qualify.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (values 0-9, 0 is land) and k',
  url: 'https://leetcode.com/problems/count-islands-with-total-value-divisible-by-k/',
  complexity: 'O(m * n) time and space for the flood fill. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,0],[0,2]],"k":2}' },
    { label: 'Example 2', input: '{"grid":[[1,2,0],[0,3,0],[4,0,5]],"k":3}' },
    { label: 'Single land cell', input: '{"grid":[[0]],"k":1}' },
    { label: 'Single nonzero cell', input: '{"grid":[[5]],"k":1}' },
    { label: 'Equal cells', input: '{"grid":[[1,1],[1,1]],"k":2}' },
    { label: 'Long run: 8 by 8 grid', input: '{"grid":[[9,2,5,2,3,1,0,0],[9,1,9,4,6,1,2,1],[0,7,1,8,4,6,2,9],[9,9,2,2,9,0,9,2],[6,7,3,2,7,6,1,0],[7,0,2,2,0,4,4,7],[2,2,0,8,2,7,8,5],[2,0,4,6,7,5,4,0]],"k":12}' },
  ],
}

export default function CountIslandsDivisibleByK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid } = run.input
    const view = {
      rows: grid.length, cols: grid[0].length,
      text: (r, c) => String(grid[r][c]),
      blocked: (r, c) => grid[r][c] === 0,
    }
    return <>
      <GraphTraversalView title="Grid (values, 0 is land)" grid={view} current={step.current} visited={step.visited} showFrontier={false} />
      <output aria-label="Island total">{`Island total so far: ${step.total}. Islands counted: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each island is one flood fill over its non-zero cells, so every cell is added to exactly one island total.</p>
    <p>Only the total is compared with k, so the cell positions matter only for finding which cells belong together.</p>
  </>} />
}
