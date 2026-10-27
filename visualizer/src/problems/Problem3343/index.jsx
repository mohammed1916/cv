import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digit sum', description: 'Check that the digit sum is even and split it in half.' },
    { id: 'digit', label: 'Digits', description: 'Decide how many copies of this digit go to even positions.' },
    { id: 'done', label: 'Complete', description: 'Report the balanced count modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num, a digit string (JSON)',
  url: 'https://leetcode.com/problems/count-number-of-balanced-permutations/',
  complexity: 'O(10 * L * (L / 2) * sum) time for L digits. The visualization caps num at 10 digits.',
  examples: [
    { label: 'Example 1', input: '{"num":"123"}' },
    { label: 'Repeated digits', input: '{"num":"11"}' },
  ],
}

export default function BalancedPermutations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits (even and odd positions)" length={run.digits.length}
      valueAt={i => run.digits[i]} active={-1} roleAt={i => (i % 2 === 0 ? 'even position' : 'odd position')} />
    <output aria-label="Progress">{step.digit >= 0 ? `Digit ${step.digit} processed; ${step.reach} states reachable` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A permutation is balanced when the digits at even positions and at odd positions have equal sums, so each has half the total.</p>
    <p>The count of arrangements is the sum over ways to choose which digits go to even positions, weighted by the ways to order each side.</p>
  </>} />
}
