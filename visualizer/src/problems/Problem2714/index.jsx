import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LayeredCostView from './LayeredCostView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Source', description: 'The source starts at cost 0 with no free hops used.' },
    { id: 'pop', label: 'Settle', description: 'Take the cheapest unsettled state.' },
    { id: 'pay', label: 'Pay', description: 'Relax an outgoing edge at full cost.' },
    { id: 'free', label: 'Free hop', description: 'Relax the same edge at no cost, one more free hop used.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest destination cost, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges ([from, to, weight]), source, destination and k',
  url: 'https://leetcode.com/problems/find-shortest-path-with-k-hops/',
  complexity: 'O(n^2 * k + n * k * m) time with a linear scan for the cheapest state, and O(n * k) space for the cost table, for m directed edges. The visualization caps n at 8, edges at 16 and k at 6.',
  examples: [
    { label: 'Free hop on the costly leg', input: '{"n":5,"edges":[[0,1,4],[1,2,7],[0,3,1],[3,2,9],[2,4,2],[1,4,8]],"source":0,"destination":4,"k":1}' },
    { label: 'Unreachable', input: '{"n":3,"edges":[[0,1,2]],"source":2,"destination":0,"k":2}' },
    { label: 'Chain with two free hops', input: '{"n":4,"edges":[[0,1,3],[1,2,3],[2,3,3]],"source":0,"destination":3,"k":2}' },
  ],
}

export default function FindShortestPathWithKHops() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LayeredCostView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each node is split into one state per number of free hops already used. A free edge moves to the next column at the same cost; a paid edge stays in its column.</p>
    </>} />
}
