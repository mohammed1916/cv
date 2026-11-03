import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShopGraphView from './ShopGraphView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3928',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with prices (per shop) and roads ([a, b, cost, multiplier] entries)',
  url: 'https://leetcode.com/problems/minimum-cost-to-buy-apples-ii/',
  complexity: 'O(n * (n + m)^2) time with a simple shortest-path scan per start. The visualization caps the network at 8 shops.',
  examples: [
    { label: 'Four shops', input: '{"prices":[5,2,9,4],"roads":[[0,1,3,2],[1,2,1,4],[2,3,2,1],[0,3,10,1]]}' },
    { label: 'Two shops', input: '{"prices":[5,1],"roads":[[0,1,3,2]]}' },
  ],
}

export default function Problem3928Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShopGraphView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
