import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1550',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/three-consecutive-odds/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Late run', input: '[2,6,4,1,3,5,7]' },
    { label: 'Broken run', input: '[1,2,3,4,5]' },
    { label: 'Negative odds', input: '[-3,-5,-7]' },
    { label: 'Single value', input: '[5]' },
    { label: 'Repeated values', input: '[3,3,3]' },
    { label: 'Extremes: 20 items', input: '[20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20]' },
    { label: 'Long run: 20 values', input: '[-9,11,-10,-7,2,13,16,16,-20,-17,-10,5,-11,9,0,-3,-8,-18,1,18]' },
  ],
}

export default function ThreeConsecutiveOdds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const arr = run.input
    const { index, odd, run: length } = step.snapshot
    const l = length > 0 ? index - length + 1 : -1
    const r = index
    const roleAt = i => {
      if (length <= 0 || i < l || i > r) return ''
      if (i === l && i === r) return 'l and r'
      return i === l ? 'l' : i === r ? 'r' : 'in run'
    }
    return <>
      <IndexedSequence label="Values, left to right" length={arr.length} valueAt={i => arr[i]} active={index} roleAt={roleAt} />
      <p>{index < 0 ? 'The window is empty before the first value.' : `The current run is the window from l = ${Math.max(l, 0)} to r = ${r}; its length is ${length} of the 3 needed. ${odd === true ? 'The value is odd.' : 'The value is even, so the run resets.'}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> a single pass tracks how many odd values end at the current position. Any even value resets that count.</p>
    <p>The answer is true as soon as the count reaches three, so the scan can stop early.</p>
  </>} />
}
