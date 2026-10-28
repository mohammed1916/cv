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
    { label: 'Example 1', input: '{"nums1":[3,2,0,1,0],"nums2":[6,5,0]}' },
    { label: 'Example 2', input: '{"nums1":[2,0,2,0],"nums2":[1,4]}' },
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
