import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with the whole budget of prime factors.' },
    { id: 'split', label: 'Split', description: 'Peel off parts of 3 while more than 4 is left.' },
    { id: 'done', label: 'Complete', description: 'Multiply the parts for the divisor count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with prime_factors from 1 to 60, for example {"prime_factors":8}',
  url: 'https://leetcode.com/problems/maximize-number-of-nice-divisors/',
  complexity: 'O(log n) time with fast exponentiation. The visualization caps the input at 60.',
  examples: [
    { label: 'Example 1', input: '{"prime_factors":3}' },
    { label: 'Example 2', input: '{"prime_factors":8}' },
  ],
}

export default function NiceDivisors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Parts of the budget" length={step.parts.length} valueAt={index => step.parts[index]} active={step.parts.length - 1} />
    <output aria-label="Parts">{`Parts: ${step.parts.join(' x ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each prime's exponent in the nice number is at least one, so a divisor count of the product of parts a, b, c is a times b times c, with a plus b plus c equal to the budget.</p>
    <p>Parts of 3 give the largest product, with a 2 or a 4 to finish when the budget is not a multiple of 3.</p>
  </>} />
}
