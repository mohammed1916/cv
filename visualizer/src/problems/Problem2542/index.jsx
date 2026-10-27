import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort pairs', description: 'Order the pairs by nums2, largest first.' },
    { id: 'add', label: 'Add', description: 'Add the current nums1 value to the heap and total.' },
    { id: 'drop', label: 'Drop', description: 'Remove the smallest value when more than k are kept.' },
    { id: 'score', label: 'Score', description: 'Score the current pair as the smallest nums2.' },
    { id: 'done', label: 'Complete', description: 'Report the best score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, nums2 and k (JSON)',
  url: 'https://leetcode.com/problems/maximum-subsequence-score/',
  complexity: 'O(n log n) time for sorting and heap work. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,3,3,2],"nums2":[2,1,3,4],"k":3}' },
    { label: 'Example 2', input: '{"nums1":[4,2,3,1,1],"nums2":[7,5,10,9,6],"k":1}' },
  ],
}

export default function MaximumSubsequenceScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Pairs by nums2 (nums1/nums2)" length={step.order.length}
      valueAt={i => `${run.input.nums1[step.order[i]]}/${run.input.nums2[step.order[i]]}`}
      active={step.current} roleAt={i => (step.order[i] === undefined ? '' : `pair ${step.order[i]}`)} />
    <output aria-label="Heap and total">{`Heap: [${step.heap.join(', ')}]  total: ${step.total}  best: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The score is the sum of the chosen nums1 values times the smallest chosen nums2. Fixing a pair as the one with the smallest nums2 means every other chosen pair has a larger nums2.</p>
    <p>Sweeping from the largest nums2 down, a min-heap keeps the k largest nums1 values seen so far, so the running total is the best sum for that threshold.</p>
  </>} />
}
