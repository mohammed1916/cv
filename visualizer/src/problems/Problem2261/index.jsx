import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'Start with no subarrays recorded.' },
    { id: 'add', label: 'Extend', description: 'Record the subarray from the start index to this end index.' },
    { id: 'stop', label: 'Too many', description: 'Stop extending once the window has more than k multiples.' },
    { id: 'done', label: 'Count', description: 'Return how many distinct subarrays were recorded.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, k and p (JSON)',
  url: 'https://leetcode.com/problems/k-divisible-elements-subarrays/',
  complexity: 'O(n^2 * n) time with a set of subarray keys. The visualization caps nums at 8 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,3,2,2],"k":2,"p":2}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,4],"k":4,"p":1}' },
  ],
}

export default function DivisibleSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.end ?? -1} roleAt={i => (step.start !== null && i >= step.start && i <= step.end ? 'in window' : '')} />
    <output aria-label="Subarray state">{`${step.message} Distinct so far: ${step.distinct}`}</output>
  </>} renderReasoning={() => <>
    <p>For each start, the window only grows, so once it holds more than k multiples of p, no longer subarray from that start can qualify.</p>
    <p>Distinct subarrays are counted by their values, so two windows at different positions with the same values count once.</p>
  </>} />
}
