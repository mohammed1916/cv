import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'ones', label: 'Existing 1s', description: 'Count elements that already equal 1.' },
    { id: 'window', label: 'Gcd window', description: 'Find the shortest subarray whose gcd is 1.' },
    { id: 'done', label: 'Complete', description: 'Combine the costs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-all-array-elements-equal-to-1/',
  complexity: 'O(n^2 log M) time for the window scan, with n values up to M. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,6,3,4]}' },
    { label: 'Impossible', input: '{"nums":[2,10,6,14]}' },
    { label: 'Single value', input: '{"nums":[7]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6]}' },
    { label: 'Largest values: 10 entries', input: '{"nums":[60,59,58,57,56,55,54,53,52,51]}' },
    { label: 'Long run: 10 values from a fixed sequence', input: '{"nums":[7,20,45,51,52,60,1,48,23,60]}' },
  ],
}

export default function MinimumOperationsToOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.j}
      roleAt={i => (step.i >= 0 && i >= step.i && i <= step.j ? 'window' : '')} />
    <output aria-label="Window">{step.message}{step.best === null ? '' : ` Shortest so far: ${step.best}.`}</output>
  </>} renderReasoning={() => <>
    <p>One element becomes 1 after (length minus 1) operations on the shortest subarray whose gcd is 1, and then every other element needs one more operation.</p>
    <p>If a 1 already exists, every other element needs exactly one operation.</p>
  </>} />
}
