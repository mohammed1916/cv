import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import CostCandidateView from './CostCandidateView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No best cost yet.' },
    { id: 'candidate', label: 'Candidate', description: 'Choose how many combined units to buy.' },
    { id: 'split', label: 'Split', description: 'Cover the rest of each need with its single unit.' },
    { id: 'cost', label: 'Cost', description: 'Add up the total price of this split.' },
    { id: 'compare', label: 'Compare', description: 'Check against the best cost so far.' },
    { id: 'update', label: 'Update', description: 'This split is the new best plan.' },
    { id: 'done', label: 'Result', description: 'Report the minimum cost and keep the winning plan.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cost1, cost2, costBoth, need1 and need2',
  url: 'https://leetcode.com/problems/minimum-cost-to-acquire-required-items/',
  complexity: 'O(1) time: only three candidate counts of combined units are tested.',
  examples: [
    { label: 'Example 1', input: '{"cost1":4,"cost2":3,"costBoth":2,"need1":4,"need2":1}' },
    { label: 'Example 2', input: '{"cost1":6,"cost2":5,"costBoth":20,"need1":3,"need2":3}' },
    { label: 'Expensive combined', input: '{"cost1":3,"cost2":2,"costBoth":10,"need1":4,"need2":5}' },
    { label: 'Zero needs', input: '{"cost1":7,"cost2":6,"costBoth":11,"need1":0,"need2":0}' },
    { label: "Smallest values", input: "{\"cost1\":1,\"cost2\":1,\"costBoth\":1,\"need1\":0,\"need2\":0}" },
    { label: "Equal costs", input: "{\"cost1\":5,\"cost2\":5,\"costBoth\":5,\"need1\":2,\"need2\":2}" },
    { label: "Largest values at the limit", input: "{\"cost1\":1000000,\"cost2\":1000000,\"costBoth\":1000000,\"need1\":1000000000,\"need2\":1000000000}" },
    { label: "Long run: LCG costs and needs", input: "{\"cost1\":819618,\"cost2\":24475,\"costBoth\":6103,\"need1\":15483312,\"need2\":10481197}" },
  ],
}

export default function MinimumCostToAcquireRequiredItems() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <CostCandidateView step={step} />}
    renderReasoning={() => <>
      <p>Each combined unit covers one unit of both requirements. Buying b combined units leaves max(0, need1 minus b) and max(0, need2 minus b) single units to buy.</p>
      <p>The total cost is piecewise linear in b with breakpoints only at 0, need1 and need2. Its slope rises at each breakpoint, so the function is convex and its minimum sits at a breakpoint.</p>
      <p>So testing b = 0, need1 and need2 is enough. The winning plan is kept after the search, even when it buys excess coverage.</p>
    </>} />
}
