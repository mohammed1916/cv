import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with an empty stack.' },
    { id: 'pop', label: 'Pop larger', description: 'Remove stack values larger than the current value.' },
    { id: 'zero', label: 'Zero', description: 'A zero needs no operation.' },
    { id: 'push', label: 'New operation', description: 'A new positive value needs its own operation.' },
    { id: 'same', label: 'Covered', description: 'The same value is already on top, so no operation is added.' },
    { id: 'done', label: 'Complete', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: 1 to 12 integers from 0 to 5, e.g. {"nums":[3,1,2,1]}',
  url: 'https://leetcode.com/problems/minimum-operations-to-convert-all-elements-to-zero/',
  complexity: 'O(n) time and O(n) space for the stack. The visualization caps the input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,2]}' },
    { label: 'Example 2', input: '{"nums":[3,1,2,1]}' },
  ],
}

export default function MinimumOperationsToZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Monotonic stack">{`Stack: ${step.stack.join(' ') || '(empty)'}`}</output>
    <output aria-label="Operations">{`Operations: ${step.operations}`}</output>
  </>} renderReasoning={() => <>
    <p>A value that is still on the stack when a smaller value arrives was covered by a single operation together with the values around it.</p>
    <p>Each new positive value that is not already on top of the stack starts a new operation. The stack keeps only the values that still need one.</p>
  </>} />
}
