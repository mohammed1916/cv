import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left cell.' },
    { id: 'search', label: 'Search', description: 'Move only to neighbours whose street opens back toward this cell.' },
    { id: 'done', label: 'Result', description: 'Report whether the bottom-right cell was reached.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Grid (JSON object with grid, e.g. {"grid":[[2,4,3],[6,5,2]]})',
  url: 'https://leetcode.com/problems/check-if-there-is-a-valid-path-in-a-grid/',
  complexity: 'O(m * n) time and space for an m x n grid. The visualization caps each side at 12.',
  examples,
}

export default function CheckValidPathInGrid() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <GraphTraversalView title="Street grid" frontierKind="stack"
      grid={{ rows: run.input.grid.length, cols: run.input.grid[0].length, cells: run.input.grid.map(row => row.map(String)) }}
      current={step.current} neighbour={step.neighbour} visited={step.visited} frontier={step.frontier} done={step.done} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
