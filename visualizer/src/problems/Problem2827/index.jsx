import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Read the range and the divisor.' },
    { id: 'count', label: 'Count', description: 'Count beautiful integers up to one bound with a digit DP.' },
    { id: 'done', label: 'Combine', description: 'Subtract the count below low from the count up to high.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with low, high and k, for example {"low":10,"high":20,"k":3}',
  url: 'https://leetcode.com/problems/number-of-beautiful-integers-in-the-range/',
  complexity: 'O(d * d * k * 10) states per bound for d digits, memoized. The visualization caps high at 10000 and k at 20.',
  examples: [
    { label: 'Example 1', input: '{"low":10,"high":20,"k":3}' },
    { label: 'Divisor 1', input: '{"low":1,"high":10,"k":1}' },
  ],
}

export default function BeautifulIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range">{`Range: ${run.input.low} to ${run.input.high}, divisible by ${run.input.k}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.total}${step.bound !== '' ? ` (up to ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A beautiful integer has as many even digits as odd digits and is divisible by k. Tracking the even-minus-odd difference and the remainder mod k as the digits are read captures both conditions.</p>
    <p>Each bound is counted once with memoised states, and the range is the difference of the two bounds.</p>
  </>} />
}
