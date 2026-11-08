import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import EqualizeCostView from './EqualizeCostView'
import { buildTrace, parseInput, code, python } from './algorithm'
import './EqualizeCostView.css'

const definition = {
  phases: [
    { id: 'start', label: 'Top', description: 'Find the largest value.' },
    { id: 'balance', label: 'Balance', description: 'Find where pairs become fully usable.' },
    { id: 'target', label: 'Target', description: 'Measure the deficits for one target.' },
    { id: 'compare', label: 'Compare', description: 'Compare singles-only and paired plans.' },
    { id: 'best', label: 'Best', description: 'Keep the cheapest target so far.' },
    { id: 'done', label: 'Result', description: 'Report the best cost modulo 1000000007.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums, cost1 and cost2',
  url: 'https://leetcode.com/problems/minimum-cost-to-equalize-array/',
  complexity: 'O(n) per candidate target, with a constant number of candidates. The visualization caps nums at 12 values and each value at 60; the official limit is 10^5 values up to 10^6.',
  examples: [
    { label: 'Two values', input: '{"nums":[9,4],"cost1":4,"cost2":3}' },
    { label: 'Pairs pay off', input: '{"nums":[2,7,7,5],"cost1":3,"cost2":2}' },
    { label: 'Already level', input: '{"nums":[6,6,6],"cost1":2,"cost2":1}' },
    { label: "Single value", input: "{\"nums\":[5],\"cost1\":3,\"cost2\":2}" },
    { label: "All values equal", input: "{\"nums\":[7,7,7],\"cost1\":2,\"cost2\":5}" },
    { label: "Largest values and costs", input: "{\"nums\":[60,1,1,1,1,1,1,1,1,1,1,1],\"cost1\":60,\"cost2\":60}" },
    { label: "Long run: 12 values", input: "{\"nums\":[37,1,41,57,57,13,25,9,57,21,9,1],\"cost1\":17,\"cost2\":23}" },
  ],
}

export default function MinimumCostToEqualizeArray() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <EqualizeCostView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
