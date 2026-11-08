import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Minimum sums', description: 'Each zero counts as at least 1.' },
    { id: 'branch', label: 'Compare', description: 'Check which array can still be adjusted to match.' },
    { id: 'done', label: 'Complete', description: 'Report the equal sum or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums1 and nums2 (integers 0 to 6)',
  url: 'https://leetcode.com/problems/minimum-equal-sum-of-two-arrays-after-replacing-zeros/',
  complexity: 'O(n + m) time. The visualization caps each array at eight entries.',
  examples: [
    { label: 'Lists of different lengths', input: '{"nums1":[5,0,5,2],"nums2":[3,3,0,6,1]}' },
    { label: 'Equal values in first list', input: '{"nums1":[6,6,2],"nums2":[0,4,1,4]}' },
    { label: 'Single zero on each side', input: '{"nums1":[0],"nums2":[0]}' },
    { label: 'Equal sums already', input: '{"nums1":[2,2],"nums2":[2,2]}' },
    { label: 'Zeros only in one array', input: '{"nums1":[6,6,6,6,6,6,6,6],"nums2":[0,0,0,0,0,0,0,0]}' },
    { label: 'No zeros to replace', input: '{"nums1":[1,2],"nums2":[3,4]}' },
    { label: 'Long run: 8 entries each', input: '{"nums1":[6,3,3,4,2,4,2,4],"nums2":[1,4,3,4,1,3,3,1]}' },
  ],
}

export default function MinimumEqualSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={index => run.input.nums1[index]} active={-1} roleAt={index => (run.input.nums1[index] === 0 ? 'zero' : '')} />
    <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={index => run.input.nums2[index]} active={-1} roleAt={index => (run.input.nums2[index] === 0 ? 'zero' : '')} />
    <output aria-label="Minimum sums">{`Minimum sum nums1: ${step.low1}, nums2: ${step.low2}`}</output>
  </>} renderReasoning={() => <>
    <p>A zero must be replaced by at least 1, so each array has a smallest possible sum.</p>
    <p>An array with no zeros cannot grow, so the target is fixed at its sum. The other array can reach it only if its minimum is not above that target.</p>
  </>} />
}
