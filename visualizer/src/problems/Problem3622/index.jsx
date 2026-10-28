import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the digit sum to zero and the digit product to one.' },
    { id: 'digit', label: 'Digit', description: 'Add the digit to the sum and multiply it into the product.' },
    { id: 'done', label: 'Check', description: 'Test whether n is divisible by sum plus product.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n from 1 to 100000, for example {"n":23}',
  url: 'https://leetcode.com/problems/check-divisibility-by-digit-sum-and-product/',
  complexity: 'O(d) time for d digits.',
  examples: [
    { label: 'Example 1', input: '{"n":23}' },
    { label: 'Zero digit', input: '{"n":10}' },
  ],
}

export default function DigitSumProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n" length={run.digits.length} valueAt={index => run.digits[index]} active={step.position ?? -1} />
    <output aria-label="Digit sum and product">{`Sum: ${step.total}. Product: ${step.product}.`}</output>
  </>} renderReasoning={() => <>
    <p>The divisor is the sum of the digits plus their product. One pass over the digits gives both values.</p>
    <p>A product with a zero digit is zero, so the divisor is just the digit sum in that case.</p>
  </>} />
}
