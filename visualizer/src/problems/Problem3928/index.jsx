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
    { label: 'Two shops, no road', input: '{"prices":[4,4],"roads":[]}' },
    { label: 'Equal prices and costs', input: '{"prices":[3,3,3],"roads":[[0,1,5,2],[1,2,5,2],[0,2,5,2]]}' },
    { label: 'Largest prices and multipliers', input: '{"prices":[1000000000,1,1000000000,1,1000000000,1,1000000000,1],"roads":[[0,1,1000,100],[1,2,1,1],[2,3,999,100]]}' },
    { label: 'Long run: 8 shops, 20 roads', input: '{"prices":[32,781,419,161,798,72,483,750],"roads":[[5,6,664,61],[2,5,805,17],[1,2,824,2],[1,3,848,67],[1,7,532,87],[3,6,976,3],[2,4,749,43],[3,5,434,41],[1,6,576,90],[0,6,956,51],[2,6,543,28],[4,6,609,63],[1,4,97,51],[0,1,801,8],[2,3,10,97],[0,2,256,98],[4,7,645,68],[2,7,60,27],[0,4,294,86],[5,7,92,24]]}' },
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
