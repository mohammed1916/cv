import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RingView from './RingView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Measure half the length and the total.' },
    { id: 'count', label: 'Count', description: 'Start with no good rotations.' },
    { id: 'window', label: 'Shift 0', description: 'The array as given.' },
    { id: 'slide', label: 'Slide', description: 'Move the first-half window by one.' },
    { id: 'good', label: 'Good', description: 'The first half is strictly larger.' },
    { id: 'bad', label: 'Not good', description: 'The first half is not larger.' },
    { id: 'done', label: 'Result', description: 'Return the count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of even length (e.g. [2,5,1,4])',
  url: 'https://leetcode.com/problems/count-good-cyclic-rotations/',
  complexity: 'O(n) time and O(1) extra space for n values, using one sliding window sum. The visualization caps the array at 20 values; the official limit is 100000.',
  examples: [
    { label: 'One good shift', input: '[2,5,1,4]' },
    { label: 'Six values', input: '[3,3,1,1,6,2]' },
    { label: "Two values", input: "[4,2]" },
    { label: "Equal values", input: "[5,5,5,5]" },
    { label: "Largest values", input: "[1000,1,1000,1]" },
    { label: "Long run: 20 values", input: "[91,872,870,677,413,106,563,546,193,765,132,217,537,888,720,366,108,122,801,977]" },
  ],
}

export default function CountGoodCyclicRotations() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RingView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
