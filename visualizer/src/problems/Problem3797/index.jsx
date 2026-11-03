import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import RouteGridView from './RouteGridView'

const definition = {
  phases: [
    { id: 'start', label: 'Starts', description: 'Each available bottom cell begins one route.' },
    { id: 'row', label: 'Row', description: 'Begin a row; its sideways counts start from the routes that arrived here.' },
    { id: 'side', label: 'Sideways', description: 'Routes move within the row, never twice in a row.' },
    { id: 'down', label: 'Step up', description: 'Routes step to the row above within the reach.' },
    { id: 'done', label: 'Result', description: 'Sum the routes that end on the top row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (rows of "." and "#") and d',
  url: 'https://leetcode.com/problems/count-routes-to-climb-a-rectangular-grid/',
  complexity: 'O(rows * cols) time per run with prefix sums, and O(cols) extra space per row. The official limit is 750 by 750 with d up to 750; the visualization caps the grid at 8 by 8 and keeps d up to 750.',
  examples: [
    { label: 'Example 1', input: '{"grid":["..."],"d":2}' },
    { label: 'Example 2', input: '{"grid":["..","..","#."],"d":1}' },
    { label: 'Single row', input: '{"grid":["#..",".#."],"d":2}' },
  ],
}

export default function CountRoutesToClimbGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RouteGridView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every route ends on the top row. Arrivals are routes that reached a cell by a start or a step up. Sideways counts add the arrivals within distance d in the same row, excluding the cell itself.</p>
    <p>A sideways count is never summed again, so a sideways move cannot follow another sideways move. Only arrivals and sideways counts together can step up.</p>
    <p>Prefix sums over each row give every window in constant time.</p>
  </>} />
}
