import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the digits from smallest to largest.' },
    { id: 'deal', label: 'Deal', description: 'Alternate digits between the first number and the second number.' },
    { id: 'done', label: 'Complete', description: 'Add the two numbers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (2 to 8 digits as a string, no leading zero)',
  url: 'https://leetcode.com/problems/split-with-minimum-sum/',
  complexity: 'O(d log d) time for d digits, from the sort.',
  examples: [
    { label: 'Example 1', input: '{"num":"4325"}' },
    { label: 'Example 2', input: '{"num":"10"}' },
  ],
}

export default function SplitWithMinimumSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted digits" length={step.digits.length} valueAt={i => step.digits[i]} active={step.index} roleAt={i => (i < step.index ? (i % 2 === 0 ? 'first' : 'second') : '')} />
    <output aria-label="Two numbers so far">{`First: ${step.first || '–'}, second: ${step.second || '–'}`}</output>
  </>} renderReasoning={() => <>
    <p>The sum is smallest when the two numbers have the fewest digits in their leading places, which means dealing the sorted digits alternately.</p>
    <p>Leading zeros are allowed in the two numbers, so the smallest digit can start either one.</p>
  </>} />
}
