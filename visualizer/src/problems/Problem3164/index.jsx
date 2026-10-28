import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count nums1', description: 'Group equal values of nums1 and count them.' },
    { id: 'pair', label: 'Divisor step', description: 'Use one nums2 value and add every nums1 group it divides.' },
    { id: 'done', label: 'Complete', description: 'Report the total of good pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: { "nums1": [...], "nums2": [...], "k": integer }',
  url: 'https://leetcode.com/problems/find-the-number-of-good-pairs-ii/',
  complexity: 'O(m * d) time for m values in nums2 and d distinct values in nums1.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,3,4],"nums2":[1,3,4],"k":1}' },
    { label: 'Example 2', input: '{"nums1":[1,2,4,12],"nums2":[2,4],"k":3}' },
  ],
}

export default function GoodPairsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} roleAt={i => (step.step !== null && run.input.nums1[i] % step.step === 0 ? 'divisible' : '')} />
    <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]} active={step.j} />
    <output aria-label="Pair count">{step.step === null ? `Good pairs so far: ${step.total}` : `Divisor ${step.step}: +${step.added}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Pair (i, j) is good when nums1[i] is divisible by nums2[j] * k, so only the divisor matters for each nums2 value.</p>
    <p>Equal nums1 values share the same divisors, so they are counted together with one multiplicity.</p>
  </>} />
}
