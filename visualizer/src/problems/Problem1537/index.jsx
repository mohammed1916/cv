import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both pointers begin at the first values.' },
    { id: 'first', label: 'First list', description: 'Take the smaller value from the first list.' },
    { id: 'second', label: 'Second list', description: 'Take the smaller value from the second list.' },
    { id: 'shared', label: 'Shared value', description: 'Switch to the larger running sum.' },
    { id: 'done', label: 'Complete', description: 'Report the best score modulo 1e9 + 7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two strictly increasing lists as JSON, e.g. {"nums1": [2,4,5], "nums2": [4,6]}',
  url: 'https://leetcode.com/problems/get-the-maximum-score/',
  complexity: 'O(m + n) time and O(1) extra space for the two pointers.',
  examples: [
    { label: 'Example 1', input: '{"nums1": [2,4,5,8,10], "nums2": [4,6,8,9]}' },
    { label: 'Example 2', input: '{"nums1": [1,3,5,7,9], "nums2": [3,5,100]}' },
  ],
}

export default function MaximumScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} active={step.i < run.input.nums1.length ? step.i : -1} />
      <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]} active={step.j < run.input.nums2.length ? step.j : -1} />
      <output aria-label="Running sums">{`First sum ${step.first}, second sum ${step.second}, total ${step.total}`}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Between shared values a path must stay on one list, so the score is a choice of list for each gap between shared values.</p>
      <p>At each shared value the best choice is the list with the larger running sum, because the future is the same from either side.</p>
    </>
  )} />
}
