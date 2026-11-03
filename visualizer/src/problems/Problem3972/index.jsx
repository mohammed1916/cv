import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitWindowView from './DigitWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const phases = [
  { id: 'start', label: 'Setup', description: 'No subarray has been counted yet.' },
  { id: 'begin', label: 'Start', description: 'Begin subarrays at this index.' },
  { id: 'extend', label: 'Extend', description: 'Add the next element to the window.' },
  { id: 'match', label: 'Match', description: 'The sum is positive and its digits match x.' },
  { id: 'miss', label: 'Miss', description: 'This window does not qualify.' },
  { id: 'done', label: 'Result', description: 'Report the count.' },
]

const definition = {
  number: '3972',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (integers) and x (a digit from 0 to 9)',
  url: 'https://leetcode.com/problems/valid-subarrays-with-matching-sum-digits-ii/',
  complexity: 'O(n^2) time and O(1) extra space in this trace, checking each subarray sum directly. The visualization caps nums at 12 entries with values from -9 to 9.',
  examples: [
    { label: 'Digit three', input: '{"nums":[1,2,3],"x":3}' },
    { label: 'Mixed signs', input: '{"nums":[3,-1,4,2],"x":4}' },
    { label: 'Cancelling pair', input: '{"nums":[-4,4],"x":4}' },
  ],
}

export default function ValidSubarraysWithMatchingSumDigits() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DigitWindowView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Count: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
