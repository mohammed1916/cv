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
    { label: 'Own case 1', input: '{"nums1":[2,4,5],"nums2":[2,4,5],"k":2}' },
    { label: 'Own case 2', input: '{"nums1":[2,3,5,13],"nums2":[3,5],"k":4}' },
    { label: "Single values", input: "{\"nums1\":[1],\"nums2\":[1],\"k\":1}" },
    { label: "Largest k, repeated values", input: "{\"nums1\":[30,30,1,1,15,15,22,22,9,9],\"nums2\":[8,8,1,1,4,4,7,7],\"k\":4}" },
    { label: "Long run: ten and eight values", input: "{\"nums1\":[3,11,2,27,9,14,25,6,18,21],\"nums2\":[4,1,7,2,8,5,3,6],\"k\":3}" },
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
