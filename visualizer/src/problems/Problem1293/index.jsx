import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top left with no obstacles removed yet.' },
    { id: 'pop', label: 'Expand state', description: 'Take a (cell, removals used) state and try its four neighbours.' },
    { id: 'found', label: 'Reached', description: 'The bottom right cell is reached within the removal budget.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest number of steps, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (0 empty, 1 obstacle) and k (removal budget)',
  url: 'https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/',
  complexity: 'O(m * n * k) time and space for the state graph. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,0]],"k":1}' },
    { label: 'Example 2', input: '{"grid":[[0,1,1],[1,1,1],[1,0,0]],"k":1}' },
  ],
}

export default function ShortestPathWithElimination() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid, k } = run.input
    const view = { rows: grid.length, cols: grid[0].length, text: (r, c) => String(grid[r][c]), blocked: (r, c) => grid[r][c] === 1 }
    return <>
      <GraphTraversalView title="Grid (1 is an obstacle)" grid={view} current={step.current} frontier={step.frontier} visited={step.visited} frontierTitle="Queue of states (cells)" />
      <output aria-label="Search status">{`${step.message} Budget: ${k}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A cell can be reached cheaply with few removals or quickly with more removals, so the search keeps one state for each (cell, removals used) pair.</p>
    <p>The first time the bottom right cell leaves the queue, its step count is the shortest possible.</p>
  </>} />
}
