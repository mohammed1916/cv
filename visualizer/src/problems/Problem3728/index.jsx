import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Prefix sums', description: 'Build prefix sums of nums.' },
    { id: 'record', label: 'Record left', description: 'Store a left end that is at least two positions back.' },
    { id: 'match', label: 'Match right', description: 'Count the stored left ends that match this right end.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, for example {"nums":[9,3,3,3,9]}',
  url: 'https://leetcode.com/problems/stable-subarrays-with-equal-boundary-and-interior-sum/',
  complexity: 'O(n) expected time with a hash map. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[9,3,3,3,9]}' },
    { label: 'Example 3', input: '{"nums":[-4,4,0,0,-8,-4]}' },
  ],
}

export default function StableSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Key">{`Key: ${step.key || '(none)'}. Stable subarrays so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray is stable when its endpoints both equal the sum strictly inside. Write the inside sum as a difference of prefix sums.</p>
    <p>For each right end, the matching left ends are found in a hash map keyed by value and prefix sum, so every right end is handled in constant expected time.</p>
  </>} />
}
