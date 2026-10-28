import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix has score 0.' },
    { id: 'count', label: 'Count', description: 'Count earlier prefixes whose score is at least the current score.' },
    { id: 'done', label: 'Complete', description: 'Report the number of valid subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and ratio (JSON object with nums, a and b)',
  url: 'https://leetcode.doocs.org/en/lc/4013/',
  complexity: 'O(n log n) time with the sorted list shown here, using a list insert. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1,2],"a":3,"b":2}' },
    { label: 'Example 2', input: '{"nums":[2,2,1],"a":2,"b":1}' },
  ],
}

export default function EvenOddRatioSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Score">{`Score ${step.score}, valid subarrays so far ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Give each even number a score of b and each odd number a score of minus a. A subarray is valid exactly when its score change is at most 0 and it contains an odd number.</p>
    <p>Counting earlier prefix scores that are at least the current score gives every valid subarray that ends here.</p>
  </>} />
}
