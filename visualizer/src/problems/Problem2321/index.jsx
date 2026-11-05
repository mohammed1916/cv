import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2321',
  phases: [
    { id: 'totals', label: 'Totals', description: 'Add up each array as it stands.' },
    { id: 'first', label: 'Into nums1', description: 'Find the best subarray to swap from nums2 into nums1.' },
    { id: 'second', label: 'Into nums2', description: 'Find the best subarray to swap from nums1 into nums2.' },
    { id: 'done', label: 'Result', description: 'Pick the larger final sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums1": [5, 1, 8], "nums2": [2, 9, 3]}',
  url: 'https://leetcode.com/problems/maximum-score-after-splicing-arrays/',
  complexity: 'O(n) time and O(1) extra space: two Kadane passes over the difference of the arrays.',
  examples: [
    { label: 'Example', input: '{"nums1":[5,1,8],"nums2":[2,9,3]}' },
    { label: 'Ties', input: '{"nums1":[3,3,3],"nums2":[1,9,2]}' },
  ],
}

export default function SplicedArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums1, nums2 } = run.input
    const inBest = i => step.bestL >= 0 && i >= step.bestL && i <= step.bestR
    const role = (i, list) => (step.l >= 0 && i === step.r ? 'r' : step.l >= 0 && i === step.l ? 'l' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : inBest(i) ? 'best' : '')
    return <>
      <IndexedSequence label="nums1" length={nums1.length} valueAt={i => nums1[i]} active={step.r} roleAt={i => role(i, nums1)} />
      <IndexedSequence label="nums2" length={nums2.length} valueAt={i => nums2[i]} active={step.r} roleAt={i => role(i, nums2)} />
      <output aria-label="Totals and gains">{`nums1 ${step.total1 ?? ''} · nums2 ${step.total2 ?? ''} · best gain ${step.gain}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Swapping a subarray changes sum(nums1) by the sum of (nums2 - nums1) over that subarray, and changes sum(nums2) by the opposite. The score is the larger final sum.</p>
    <p>So the best score is the larger of two options: nums1's total plus its best subarray gain, or nums2's total plus its best gain. Each best gain is a maximum subarray sum, found with a running sum that restarts when it turns negative.</p>
  </>} />
}
