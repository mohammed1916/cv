import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Place the top left cell in the queue at distance 1.' },
    { id: 'pop', label: 'Process cell', description: 'Take the next cell from the queue and look at its eight neighbours.' },
    { id: 'found', label: 'Reached', description: 'The bottom right cell is at the front of the search.' },
    { id: 'blocked', label: 'Blocked', description: 'An end cell is blocked, so no path exists.' },
    { id: 'done', label: 'Complete', description: 'Report the path length, or -1 when no path exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (square, 0 open, 1 blocked)',
  url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
  complexity: 'O(n^2) time and space for an n by n grid. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,1],[1,0]]}' },
    { label: 'Example 2', input: '{"grid":[[0,0,0],[1,1,0],[1,1,0]]}' },
  ],
}

export default function ShortestPathBinaryMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid } = run.input
    const view = { rows: grid.length, cols: grid.length, text: () => '', blocked: (r, c) => grid[r][c] === 1 }
    return <>
      <GraphTraversalView title="Grid (8 directions)" grid={view} current={step.current} frontier={step.frontier} visited={step.visited}
        frontierTitle="Queue (front first)" />
      <output aria-label="Search status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Breadth-first search expands cells in order of distance, so the first time the bottom right cell is taken from the queue its distance is the shortest.</p>
    <p>Each cell is marked the moment it is queued, so no cell is processed twice.</p>
  </>} />
}
