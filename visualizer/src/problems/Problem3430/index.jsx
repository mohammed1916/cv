import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty total.' },
    { id: 'extend', label: 'Extend', description: 'Grow the subarray by one element and add its min plus max.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and limit (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/maximum-and-minimum-sums-of-at-most-size-k-subarrays/',
  complexity: 'O(n * k) time and O(1) space in this trace. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Example 2', input: '{"nums":[1,-3,1],"k":2}' },
  ],
}

export default function MinMaxSumSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.end}
        roleAt={i => (step.start >= 0 && i >= step.start && i <= step.end ? 'window' : '')} />
      <output aria-label="Running total">{`Running total: ${step.total}`}</output>
    </>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Growing each subarray from its start keeps its minimum and maximum up to date with one comparison each.</p>
  </>} />
}
