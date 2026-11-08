import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2444',
  phases: [
    { id: 'count', label: 'Count', description: 'Add the subarrays that end here and hold both bounds.' },
    { id: 'skip', label: 'Skip', description: 'Nothing ends here that holds both bounds yet.' },
    { id: 'done', label: 'Result', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 3, 5, 2, 7, 5], "minK": 1, "maxK": 5}',
  url: 'https://leetcode.com/problems/count-subarrays-with-fixed-bounds/',
  complexity: 'O(n) time and O(1) extra space. Three last-seen positions are enough.',
  examples: [
    { label: 'Seven values, range 2 to 4', input: '{"nums":[5,1,4,4,2,3,9],"minK":2,"maxK":4}' },
    { label: 'Repeats', input: '{"nums":[2,2,2],"minK":2,"maxK":2}' },
    { label: 'Single value', input: '{"nums":[4],"minK":4,"maxK":4}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5],"minK":1,"maxK":4}' },
    { label: 'Largest bounds', input: '{"nums":[9,1,9,1,9,1,9,1,9,1,9,1,9,1],"minK":1,"maxK":9}' },
    { label: 'Long run: 14 values', input: '{"nums":[6,8,6,6,2,9,6,6,9,8,8,1,3,8],"minK":2,"maxK":6}' },
  ],
}

export default function FixedBounds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.r}
        roleAt={i => (i === step.lastMin ? 'min' : i === step.lastMax ? 'max' : step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="Count">{`count ${step.count}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A subarray ending at r works when it contains minK, contains maxK, and has no value outside the range. Track the last position of each: the last out-of-range value (lastBad), the last minK, and the last maxK.</p>
    <p>The subarrays ending at r that start after lastBad and include both bounds number min(lastMin, lastMax) - lastBad.</p>
  </>} />
}
