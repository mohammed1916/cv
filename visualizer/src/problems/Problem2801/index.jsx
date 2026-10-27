import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Read the two bounds.' },
    { id: 'count', label: 'Count', description: 'Count stepping numbers up to one bound with a digit DP.' },
    { id: 'done', label: 'Combine', description: 'Combine the two counts into the range answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with low and high as digit strings, for example {"low":"1","high":"11"}',
  url: 'https://leetcode.com/problems/count-stepping-numbers-in-range/',
  complexity: 'O(d * 10 * 2) states per bound for d digits, memoized. The visualization caps bounds at 4 digits.',
  examples: [
    { label: 'Example 1', input: '{"low":"1","high":"11"}' },
    { label: 'Two digits', input: '{"low":"90","high":"101"}' },
  ],
}

export default function CountSteppingNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range">{`Range: ${run.input.low} to ${run.input.high}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.total}${step.bound ? ` (up to ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A stepping number changes by exactly one between neighbouring digits, so the only information needed while walking the digits is the previous digit.</p>
    <p>Memoising on (position, previous digit, tight, started) means each state is solved once, and the same counts answer both bounds.</p>
  </>} />
}
