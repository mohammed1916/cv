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
    { label: 'Example 1', input: '{"n":3,"k":2,"budget":15,"composition":[[1,1,1],[1,1,10]],"stock":[0,0,0],"cost":[1,2,3]}' },
    { label: 'Example 2', input: '{"n":3,"k":2,"budget":15,"composition":[[1,1,10],[1,1,1]],"stock":[0,0,100],"cost":[1,2,3]}' },
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
