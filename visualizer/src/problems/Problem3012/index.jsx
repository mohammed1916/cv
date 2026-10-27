import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'min', label: 'Smallest', description: 'Find the smallest value and how often it appears.' },
    { id: 'scan', label: 'Remainders', description: 'Check whether every value is a multiple of the smallest.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/minimize-length-of-array-using-operations/',
  complexity: 'O(n) time for n values, with one pass for the minimum and one for the remainder check. The visualization caps input at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,4,3,1]}' },
    { label: 'Equal minima', input: '{"nums":[5,5,5,10,5]}' },
    { label: 'Remainder', input: '{"nums":[2,3,4]}' },
  ],
}

export default function MinimizeLengthUsingOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p><strong>Smallest value:</strong> {step.smallest}</p>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Result">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Taking x modulo the smallest value gives a remainder below the smallest value, and such a remainder lets the array shrink to one element.</p>
    <p>If every value is a multiple of the smallest, the modulo results are zero and cannot be reused, so the copies of the smallest value pair up and the count halves, rounded up.</p>
  </>} />
}
