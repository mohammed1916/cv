import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty subset', description: 'Start with XOR 0 from keeping nothing.' },
    { id: 'add', label: 'Add value', description: 'Each XOR value can extend by this element.' },
    { id: 'done', label: 'Complete', description: 'Report the removals, or -1 if the target is unreachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and target (JSON object with nums and target)',
  url: 'https://leetcode.com/problems/minimum-removals-to-achieve-target-xor/',
  complexity: 'O(n * X) time where X is the number of distinct XOR values reached. The visualization caps input at 14 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"target":2}' },
    { label: 'Unreachable', input: '{"nums":[2,4],"target":1}' },
    { label: 'Already equal', input: '{"nums":[7],"target":7}' },
  ],
}

export default function MinimumRemovalsTargetXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1} />
    <output aria-label="Reach">{`Adding ${step.value ?? '-'}, reachable XOR values ${step.size}, target ${run.input.target}, result ${step.result ?? 'pending'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The table keeps, for each XOR value, the largest subset that reaches it. Removals are the array length minus that largest kept size.</p>
  </>} />
}
