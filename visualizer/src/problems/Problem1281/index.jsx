import IndexedSequence from '../../components/shared/IndexedSequence'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1281',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  url: 'https://leetcode.com/problems/subtract-the-product-and-sum-of-digits-of-an-integer/',
  complexity: 'O(d) time and O(1) extra space, where d is the number of decimal digits.',
  examples: [
    { label: 'Four digits', input: '{"n":3945}' },
    { label: 'Contains a zero', input: '{"n":1002}' },
    { label: 'Single digit', input: '{"n":7}' },
  ],
}

export default function DigitProductAndSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { digits, index, digit, product, total } = step.snapshot
    return <>
      <IndexedSequence label="Digits of n, read left to right" length={digits.length} active={index}
        valueAt={k => digits[k]} roleAt={k => k === index ? 'digit pointer' : ''} />
      <p>{digit === null ? `Number: ${run.input.n}` : `Current digit: ${digit}`}</p>
      <p>Product so far: {product} · Sum so far: {total}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two accumulators:</strong> one digit pass builds both the product and the sum, so the number is read only once.</p>
    <p><strong>Zero digits:</strong> a single zero makes the product zero, which the same loop handles without special cases.</p>
  </>} />
}
