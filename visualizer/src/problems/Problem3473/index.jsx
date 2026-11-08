import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'With zero subarrays every prefix totals zero.' },
    { id: 'row', label: 'New row', description: 'Start the next row, where j subarrays are allowed.' },
    { id: 'cell', label: 'Fill cell', description: 'Take the best of skipping the element or ending a subarray here.' },
    { id: 'done', label: 'Complete', description: 'Report the best total with k subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, k and m',
  url: 'https://leetcode.com/problems/sum-of-k-subarrays-with-length-at-least-m/',
  complexity: 'O(k * n^2) time with this direct DP. The visualization caps nums at 12 elements.',
  examples: [
    { label: 'Five values, m two', input: '{"nums":[120,-40,75,-9,300],"k":2,"m":2}' },
    { label: 'Six values, m three', input: '{"nums":[-500,-250,1000,40,-7,88],"k":2,"m":3}' },
    { label: 'Single element with m 1', input: '{"nums":[5],"k":1,"m":1}' },
    { label: 'Equal values with m 2', input: '{"nums":[2,2,2,2],"k":2,"m":2}' },
    { label: 'Extreme values with m 3', input: '{"nums":[10000,-10000,10000,-10000,10000,-10000],"k":2,"m":3}' },
    { label: 'Negative values with m 1', input: '{"nums":[-5,-1,-7],"k":1,"m":1}' },
    { label: 'Long run: 12 values, m 3', input: '{"nums":[-8675,-8549,-9312,1877,3487,-717,-6169,9997,-1649,-9816,-2794,-3348],"k":4,"m":3}' },
  ],
}

export default function SumOfKSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i - 1}
        roleAt={i => (i === step.i - 1 ? 'active' : '')} />
      <output aria-label="Table value">{`Row j=${step.j}, prefix i=${step.i}: ${step.value === null ? 'impossible' : step.value}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>Each cell asks: is it better to skip this element, or to end a new subarray here that starts after a valid split of the previous row?</p>
    <p>A subarray ending at i must start at s with i - s at least m, so the scan stops at i - m.</p>
  </>} />
}
