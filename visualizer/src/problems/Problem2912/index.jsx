import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GridClassView from './GridClassView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Classify', description: 'Place the source relative to the destination.' },
    { id: 'move', label: 'Move', description: 'Apply one more move to every class count.' },
    { id: 'done', label: 'Result', description: 'Report the ways that end on the destination.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, m, k, source and destination (one-based [row, column]), e.g. {"n":3,"m":4,"k":3,"source":[1,1],"destination":[2,3]}',
  url: 'https://leetcode.com/problems/number-of-ways-to-reach-destination-in-the-grid/',
  complexity: 'O(k) time and O(1) space, because the grid is summarised by four class counts. The visualization caps the grid at 8 x 8 and k at 12; the sums are taken modulo 1000000007. Source and destination are one-based [row, column] cells, and a move may jump any distance along a row or column.',
  examples: [
    { label: 'Diagonal source', input: '{"n":3,"m":4,"k":3,"source":[1,1],"destination":[2,3]}' },
    { label: 'Same cell', input: '{"n":2,"m":2,"k":2,"source":[1,2],"destination":[1,2]}' },
    { label: "Single cell, zero moves", input: "{\"n\":1,\"m\":1,\"k\":0,\"source\":[1,1],\"destination\":[1,1]}" },
    { label: "Zero moves cannot reach another cell", input: "{\"n\":2,\"m\":2,\"k\":0,\"source\":[1,1],\"destination\":[2,2]}" },
    { label: "Opposite corners on an 8 by 8 grid", input: "{\"n\":8,\"m\":8,\"k\":12,\"source\":[1,1],\"destination\":[8,8]}" },
    { label: "Long run: 8 by 8 grid, 10 moves", input: "{\"n\":8,\"m\":8,\"k\":10,\"source\":[4,4],\"destination\":[5,6]}" },
  ],
}

export default function NumberOfWaysToReachDestinationInTheGrid() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <GridClassView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Only four numbers are tracked. Each cell of a class has the same number of moves into every other class, so the grid never needs to be stored cell by cell.</p>
    </>} />
}
