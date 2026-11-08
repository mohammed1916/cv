import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Fourteen to twenty-nine', input: '{"l":14,"r":29}' },
    { label: 'Single digits', input: '{"l":1,"r":15}' },
    { label: 'Single position', input: '{"l":7,"r":7}' },
    { label: 'Shortest range at the top', input: '{"l":10000,"r":10000}' },
    { label: 'Full range', input: '{"l":1,"r":10000}' },
    { label: 'Long run: wide range', input: '{"l":2,"r":9999}' },
  ],
}

export default function CountBeautifulNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range">{`Range: ${run.input.l} to ${run.input.r}`}</output>
    {step.bound !== '' && <IndexedSequence label={`Digits of ${step.bound} (most significant first)`} length={String(step.bound).length}
      valueAt={index => String(step.bound)[index]} roleAt={index => index === 0 ? 'leading digit' : 'digit'} />}
    <output aria-label="Running count">{`Count so far: ${step.total}${step.bound !== '' ? ` (up to ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A number is beautiful when its digit product is divisible by its digit sum. Both values are built up digit by digit, so the DP carries them as state.</p>
    <p>A zero digit makes the product zero, which is divisible by any positive sum, so such numbers always count.</p>
  </>} />
}
