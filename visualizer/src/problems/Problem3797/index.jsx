import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

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
    { label: 'Example 1', input: '{"grid":["..","#."],"d":1}' },
    { label: 'Example 2', input: '{"grid":["..","#."],"d":2}' },
    { label: 'Single row', input: '{"grid":[".."],"d":1}' },
  ],
}

export default function CountRoutesToClimbGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const matrix = step.table.map(line => line.map(value => (value === null ? '-' : value)))
    return <>
      <MatrixGrid matrix={matrix} label="Routes per cell (# is blocked, - is not yet known)" activeCell={step.cell} cellWidth={52} cellHeight={48} />
      <output aria-label="Route count">{`d = ${run.input.d}, answer ${step.result ?? 'pending'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every route ends on the top row. A cell's routes are the routes that stepped up into it plus the routes that moved sideways within its row, and a sideways move can only follow a route that did not just move sideways.</p>
    <p>Prefix sums over each row give every window of sideways or upward moves in constant time.</p>
  </>} />
}
