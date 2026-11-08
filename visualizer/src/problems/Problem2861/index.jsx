import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the alloy range from zero to the stock-plus-budget bound.' },
    { id: 'check', label: 'Check machine', description: 'Price the missing metal on one machine.' },
    { id: 'probe', label: 'Probe', description: 'Keep the middle count if some machine can afford it.' },
    { id: 'done', label: 'Complete', description: 'Report the most alloys that can be made.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, k, budget, composition, stock and cost',
  url: 'https://leetcode.com/problems/maximum-number-of-alloys/',
  complexity: 'O(k * n * log(max)) time. The visualization caps input at 3 metals and 3 machines.',
  examples: [
    { label: 'Two metals, two machines', input: '{"n":2,"k":2,"budget":12,"composition":[[2,1],[1,3]],"stock":[0,1],"cost":[1,2]}' },
    { label: 'Example 2', input: '{"n":3,"k":2,"budget":15,"composition":[[1,1,10],[1,1,1]],"stock":[0,0,100],"cost":[1,2,3]}' },
    { label: "One metal, one machine, no budget", input: "{\"n\":1,\"k\":1,\"budget\":0,\"composition\":[[1]],\"stock\":[0],\"cost\":[1]}" },
    { label: "Identical machines tie", input: "{\"n\":2,\"k\":2,\"budget\":10,\"composition\":[[2,2],[2,2]],\"stock\":[3,3],\"cost\":[1,1]}" },
    { label: "No stock and no budget gives zero alloys", input: "{\"n\":2,\"k\":1,\"budget\":0,\"composition\":[[1,1]],\"stock\":[0,0],\"cost\":[2,3]}" },
    { label: "Largest budget and stock", input: "{\"n\":3,\"k\":3,\"budget\":50,\"composition\":[[10,10,10],[1,1,1],[10,1,10]],\"stock\":[100,100,100],\"cost\":[3,3,3]}" },
    { label: "Long run: 3 machines, 3 metals", input: "{\"n\":3,\"k\":3,\"budget\":50,\"composition\":[[4,8,8],[6,2,9],[6,8,10]],\"stock\":[95,91,99],\"cost\":[2,1,1]}" },
  ],
}

export default function MaximumAlloys() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stock by metal" length={run.input.stock.length} valueAt={i => run.input.stock[i]} active={-1}
      roleAt={() => ''} />
    <output aria-label="Search">{`Range ${step.low} to ${step.high}${step.mid === null ? '' : `, testing ${step.mid} alloys`}${step.machine === null || step.machine === undefined ? '' : `, machine ${step.machine} costs ${step.spent}`}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Making more alloys never costs less on any machine, so the feasible counts form a prefix and binary search finds the largest one.</p>
  </>} />
}
