import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2454',
  phases: [
    { id: 'scan', label: 'Scan', description: 'Pop the indices that now have a greater value, and move waiting indices between stacks.' },
    { id: 'done', label: 'Result', description: 'Return the second greater value for each index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [3, 1, 4, 1, 5]}',
  url: 'https://leetcode.com/problems/next-greater-element-iv/',
  complexity: 'O(n) time and O(n) space with two monotonic stacks. Each index moves between stacks at most once.',
  examples: [
    { label: 'Example', input: '{"nums":[3,1,4,1,5]}' },
    { label: 'Ascending', input: '{"nums":[1,2,3,4]}' },
  ],
}

export default function SecondGreater() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="values" length={nums.length} valueAt={i => nums[i]} active={step.i}
        roleAt={i => (step.secondIdx.includes(i) ? 'second' : step.firstIdx.includes(i) ? 'first' : step.ans[i] !== -1 ? 'answered' : '')} />
      <p aria-label="First stack">{`first stack (values): ${step.first.join(', ') || 'empty'}`}</p>
      <p aria-label="Second stack">{`second stack (values): ${step.second.join(', ') || 'empty'}`}</p>
      <output aria-label="Answers">{`answers ${step.ans.join(', ')}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Each index waits for its first greater value, then for its second. Two stacks hold them: the first holds indices still waiting for a first greater value, the second holds indices that already have one.</p>
    <p>When a value arrives, it resolves the second stack first, then moves the indices it resolves the first greater value for onto the second stack, keeping order.</p>
  </>} />
}
