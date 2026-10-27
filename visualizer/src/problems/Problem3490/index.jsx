import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Read the range from l to r.' },
    { id: 'count', label: 'Count', description: 'Count beautiful numbers up to one bound with a digit DP.' },
    { id: 'done', label: 'Combine', description: 'Subtract the count below l from the count up to r.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with l and r, for example {"l":10,"r":20}',
  url: 'https://leetcode.com/problems/count-beautiful-numbers/',
  complexity: 'O(d * S * P) states per bound for d digits, digit sum S and digit product P, memoized. The visualization caps r at 10000.',
  examples: [
    { label: 'Example', input: '{"l":10,"r":20}' },
    { label: 'Single digits', input: '{"l":1,"r":15}' },
  ],
}

export default function CountBeautifulNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range">{`Range: ${run.input.l} to ${run.input.r}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.total}${step.bound !== '' ? ` (up to ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A number is beautiful when its digit product is divisible by its digit sum. Both values are built up digit by digit, so the DP carries them as state.</p>
    <p>A zero digit makes the product zero, which is divisible by any positive sum, so such numbers always count.</p>
  </>} />
}
