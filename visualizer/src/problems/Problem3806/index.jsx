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
    { label: 'Three values, m two', input: '{"nums":[3,7,2],"k":4,"m":2}' },
    { label: 'Single value, m one', input: '{"nums":[9],"k":1,"m":1}' },
    { label: 'One value', input: '{"nums":[7],"k":7,"m":1}' },
    { label: 'Equal values', input: '{"nums":[4,4,4],"k":4,"m":2}' },
    { label: 'Maximum values, five blocks', input: '{"nums":[15,15,15,15,15],"k":30,"m":5}' },
    { label: 'Long run: 5 values', input: '{"nums":[12,14,11,12,9],"k":25,"m":3}' },
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
