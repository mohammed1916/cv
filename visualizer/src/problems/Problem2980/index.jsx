import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No even numbers have been counted yet.' },
    { id: 'even', label: 'Even number', description: 'An even number adds one to the count.' },
    { id: 'odd', label: 'Odd number', description: 'An odd number is skipped.' },
    { id: 'found', label: 'Found', description: 'Two even numbers make a trailing zero possible.' },
    { id: 'done', label: 'Complete', description: 'Report that no pair was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: 2 to 20 integers from 1 to 100, e.g. {"nums":[1,2,3,4,5]}',
  url: 'https://leetcode.com/problems/check-if-bitwise-or-has-trailing-zeros/',
  complexity: 'O(n) time and O(1) space. The visualization caps the input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,5]}' },
    { label: 'Example 2', input: '{"nums":[1,3,5,7,9]}' },
  ],
}

export default function CheckTrailingZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (run.input.nums[i] % 2 === 0 ? 'even' : 'odd')} />
    <output aria-label="Even count">{`Even numbers counted: ${step.evens}`}</output>
  </>} renderReasoning={() => <>
    <p>The OR of a set of numbers has a trailing zero only when every number in the set is even, because one odd number sets the lowest bit.</p>
    <p>Two even numbers always form such a set, so counting evens is enough.</p>
  </>} />
}
