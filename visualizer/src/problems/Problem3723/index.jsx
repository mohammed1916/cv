import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'check', label: 'Feasible', description: 'Check whether the sum fits the digit count.' },
    { id: 'fill', label: 'Fill', description: 'Place 9s, the leftover digit, then zeros.' },
    { id: 'done', label: 'Result', description: 'The number built from the digits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num and sum',
  url: 'https://leetcode.com/problems/maximize-sum-of-squares-of-digits/',
  complexity: 'O(num) time to write the digits.',
  examples: [
    { label: 'Example', input: '{"num":3,"sum":20}' },
    { label: 'Too large', input: '{"num":2,"sum":19}' },
    { label: 'One digit exact', input: '{"num":1,"sum":9}' },
    { label: 'Exact maximum for two digits', input: '{"num":2,"sum":18}' },
    { label: 'Largest sum allowed', input: '{"num":50,"sum":450}' },
    { label: 'Long run: 37 digits', input: '{"num":37,"sum":200}' },
  ],
}

export default function MaximizeSumOfSquaresOfDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="digits" length={run.input.num} valueAt={i => (i < step.digits.length ? step.digits[i] : '-')} active={-1}
      roleAt={i => (i < step.digits.length && step.digits[i] === 9 ? 'nine' : '')} />
    <output aria-label="Digits so far">{step.digits.length === 0 && step.message.includes('no good') ? 'no good integer' : `digits so far: ${step.digits.join('') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>The sum of squares is largest when the digits are as uneven as possible: as many 9s as fit, one leftover digit, and zeros for the rest.</p>
    <p>Writing the digits in descending order gives the largest number among those with that maximum score.</p>
  </>} />
}
