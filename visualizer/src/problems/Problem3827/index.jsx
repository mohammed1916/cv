import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Zero', description: 'Zero is monobit, so start the count at 1.' },
    { id: 'add', label: 'All ones', description: 'Add the next number whose binary form is all ones.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Upper bound (JSON object with n)',
  url: 'https://leetcode.com/problems/count-monobit-integers/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":1}' },
    { label: 'Example 2', input: '{"n":4}' },
  ],
}

export default function CountMonobitIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <IndexedSequence label="Monobit values found" length={step.values.length} valueAt={i => step.values[i].toString(2)}
      active={step.values.length - 1} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The only monobit integers are 0 and the numbers 1, 3, 7, 15, ... whose binary form is all ones. Values like 2 or 4 have mixed bits.</p>
  </>} />
}
