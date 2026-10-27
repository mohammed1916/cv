import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Set up', description: 'Write n in base 9.' },
    { id: 'digit', label: 'Take a digit', description: 'The remainder after dividing by 9 is the next digit.' },
    { id: 'divide', label: 'Divide', description: 'Shift to the next base-9 place.' },
    { id: 'done', label: 'Complete', description: 'Read the digits back as a base-10 number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n (JSON number)',
  url: 'https://leetcode.com/problems/remove-9/',
  complexity: 'O(log n) time and space. The visualization accepts n up to 1,000,000.',
  examples: [
    { label: 'Example 1', input: '{"n":9}' },
    { label: 'Larger', input: '{"n":1000}' },
  ],
}

export default function Remove9() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Base-9 digits, least significant first" length={step.digits.length} valueAt={i => step.digits[i]} />
    <output aria-label="Result">{step.result === null ? `Remaining quotient: ${step.quotient}` : `Result: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Counting skips 9, 19, 29 and so on, which makes the count awkward. Base 9 uses the same digits as the valid numbers, so each base-9 numeral maps to exactly one valid integer.</p>
    <p>Reading the base-9 digits as decimal digits gives the answer directly.</p>
  </>} />
}
