import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every answer starts at 0.' },
    { id: 'resolve', label: 'Resolve', description: 'A larger value arrives, so every waiting position above it gets that value.' },
    { id: 'push', label: 'Wait', description: 'Push this position; it waits for a larger value.' },
    { id: 'done', label: 'Complete', description: 'Positions still on the stack have no larger value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"values": [...]} with values 1 to 10, in list order',
  url: 'https://leetcode.com/problems/next-greater-node-in-linked-list/',
  complexity: 'O(n) time and O(n) space with a monotonic stack.',
  examples: [
    { label: 'Example 1', input: '{"values":[2,1,5]}' },
    { label: 'Example 2', input: '{"values":[2,7,4,3,5]}' },
  ],
}

export default function NextGreaterNode() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="List values" length={run.input.values.length} valueAt={i => run.input.values[i]} active={step.index}
      roleAt={i => (step.stack.includes(i) ? 'waiting' : step.answer[i] ? 'answered' : '')} />
    <IndexedSequence label="Answers so far" length={step.answer.length} valueAt={i => step.answer[i]} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The stack holds positions whose next greater value has not been seen yet, with values in decreasing order from bottom to top.</p>
    <p>A new value resolves every waiting position with a smaller value, so each position is pushed and popped at most once.</p>
  </>} />
}
