import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MinimumApplesView from './MinimumApplesView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2473',
  phases: [
    { id: 'build', label: 'Roads', description: 'Store each road in both directions.' },
    { id: 'start', label: 'Start', description: 'Begin the search from one city.' },
    { id: 'pick', label: 'Pick', description: 'Choose the nearest unsettled city.' },
    { id: 'settle', label: 'Settle', description: 'Freeze that city distance.' },
    { id: 'relax', label: 'Relax', description: 'Check a road out of the settled city.' },
    { id: 'candidate', label: 'Buy', description: 'Price buying an apple in each city.' },
    { id: 'append', label: 'Store', description: 'Keep the best total for this start.' },
    { id: 'done', label: 'Result', description: 'Report every start city answer.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n, roads, apple_cost and k ([a, b, cost] roads)',
  url: 'https://leetcode.com/problems/minimum-cost-to-buy-apples/',
  complexity: 'O(n * (n^2 + m)) time for n cities and m roads with this simple selection step, and O(n + m) space. The visualization caps n at 7; the official limits are larger.',
  examples: [
    { label: 'Chain of four', input: '{"n":4,"roads":[[0,1,2],[1,2,1],[2,3,3]],"apple_cost":[9,2,7,1],"k":2}' },
    { label: 'Hub with a cheap apple', input: '{"n":5,"roads":[[0,1,4],[0,2,1],[2,3,2],[3,4,5],[1,4,1]],"apple_cost":[8,6,20,3,7],"k":3}' },
    { label: 'Isolated city', input: '{"n":3,"roads":[[0,1,1]],"apple_cost":[5,4,1],"k":1}' },
  ],
}

export default function MinimumCostToBuyApples() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MinimumApplesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} The return trip uses the road cost multiplied by k, so a city d roads away costs apple + (k + 1) * d in total.</p>}
    />
  )
}
