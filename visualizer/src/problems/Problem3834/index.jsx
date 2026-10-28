import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The stack begins empty.' },
    { id: 'read', label: 'Read', description: 'Take the next value from the array.' },
    { id: 'merge', label: 'Merge', description: 'The top equals the current value, so combine them.' },
    { id: 'push', label: 'Push', description: 'Place the current value on the stack.' },
    { id: 'done', label: 'Complete', description: 'Return the stack as the merged array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/merge-adjacent-equal-elements/',
  complexity: 'O(n) amortized time and O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,1,1,2]}' },
    { label: 'Cascade', input: '{"nums":[1,1,2]}' },
    { label: 'No merge', input: '{"nums":[3,7,5]}' },
  ],
}

export default function MergeAdjacentEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i < step.index ? 'read' : '')} />
    <output aria-label="Stack">{`Stack: [${step.stack.join(', ')}]`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the top of the stack can merge with the current value. A merge can create a value that matches the new top, so the check repeats until the top differs.</p>
  </>} />
}
