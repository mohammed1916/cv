import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Totals', description: 'Sum each array.' },
    { id: 'gain1', label: 'Into nums1', description: 'Best interval to copy from nums2.' },
    { id: 'gain2', label: 'Into nums2', description: 'Best interval to copy from nums1.' },
    { id: 'done', label: 'Result', description: 'Take the better splice.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 of equal length (values 1 to 100)',
  url: 'https://leetcode.com/problems/maximum-score-of-spliced-array/',
  complexity: 'O(n) time and O(1) extra space with two Kadane passes.',
  examples: [
    { label: 'Example', input: '{"nums1":[60,60,60],"nums2":[10,90,10]}' },
    { label: 'Mixed', input: '{"nums1":[20,40,20,70,30],"nums2":[50,20,50,40,20]}' },
  ],
}

export default function MaximumScoreOfSplicedArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Index" length={run.input.nums1.length} valueAt={i => `${run.input.nums1[i]}|${run.input.nums2[i]}`} active={step.at}
      roleAt={i => (step.phase === 'gain1' && i <= step.at ? 'into1' : step.phase === 'gain2' && i <= step.at ? 'into2' : '')} />
    <output aria-label="Splice gain">{step.gain === null ? `totals: ${step.total}` : `best gain ${step.gain}, running ${step.cur}`}</output>
  </>} renderReasoning={() => <>
    <p>Swapping the interval [l, r] changes the sum of nums1 by the sum of nums2 minus nums1 on that interval. The best swap is therefore the maximum-sum subarray of the differences, or nothing at all.</p>
    <p>Doing this once in each direction and taking the larger total gives the answer.</p>
  </>} />
}
