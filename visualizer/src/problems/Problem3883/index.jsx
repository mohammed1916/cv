import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Position 0', description: 'Values with the first digit sum start with one way each.' },
    { id: 'position', label: 'Next position', description: 'Each allowed value inherits the total of ways from smaller values.' },
    { id: 'done', label: 'Complete', description: 'Add up all ways for the final position.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit sums (JSON object with digit_sum)',
  url: 'https://leetcode.com/problems/count-non-decreasing-arrays-with-given-digit-sums/',
  complexity: 'O(n * 5001) time with digit sums cached per value. The visualization caps input at 6 positions.',
  examples: [
    { label: 'Example 1', input: '{"digit_sum":[25,1]}' },
    { label: 'Example 2', input: '{"digit_sum":[1]}' },
    { label: 'Impossible', input: '{"digit_sum":[2,49,23]}' },
  ],
}

export default function CountNonDecreasingDigitSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digit sums per position" length={run.input.digit_sum.length} valueAt={i => run.input.digit_sum[i]} active={step.position} />
    <output aria-label="Ways">{`Position ${step.position}, ways ${step.total ?? '-'}, result ${step.result ?? 'pending'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A value at one position may follow any value that is no larger at the previous position. The running total supplies that count in one pass.</p>
  </>} />
}
