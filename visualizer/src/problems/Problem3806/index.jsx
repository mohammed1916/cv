import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an answer of zero.' },
    { id: 'try', label: 'Try a bit', description: 'Check whether the answer can contain this bit.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum AND.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values and budget (JSON object with nums, k, m)',
  url: 'https://leetcode.com/problems/maximum-bitwise-and-after-increment-operations/',
  complexity: 'O(bits * n log n) time. The visualization caps n at 5 and values at 15.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,1,2],"k":8,"m":2}' },
    { label: 'Example 2', input: '{"nums":[1,2,8,4],"k":7,"m":3}' },
  ],
}

export default function MaximumBitwiseAndAfterIncrements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Values, cost to reach the candidate" length={run.input.nums.length}
      valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.costs && step.costs.length ? `+${step.costs[i]}` : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>If a candidate AND is achievable, any smaller value formed from its bits is also achievable, so checking bits from the top gives the maximum.</p>
  </>} />
}
