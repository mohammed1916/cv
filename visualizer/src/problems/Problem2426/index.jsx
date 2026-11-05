import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Differences', description: 'Compute d[i] = nums1[i] - nums2[i].' },
    { id: 'pairs', label: 'Count pairs', description: 'Count the earlier differences that are small enough for this j.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: nums1, nums2 (same length) and diff',
  url: 'https://leetcode.com/problems/number-of-pairs-satisfying-inequality/',
  complexity: 'O(n^2) time for this scan. A Fenwick tree over sorted differences gives O(n log n). The visualization caps input at 14 entries.',
  examples: [
    { label: 'Spread', input: '{"nums1":[4,1,6],"nums2":[2,2,5],"diff":1}' },
    { label: 'Zero diff', input: '{"nums1":[0,3,3],"nums2":[1,4,2],"diff":0}' },
  ],
}

export default function PairsSatisfyingInequality() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Differences d[i]" length={step.d.length} valueAt={i => step.d[i]} active={step.j ?? -1}
      roleAt={i => (step.j !== null && i < step.j ? 'compared' : '')} />
    <output aria-label="Pairs counted">{`Pairs so far: ${step.total} of ${run.result} total`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The inequality nums1[i] - nums2[i] &lt;= nums1[j] - nums2[j] + diff, for i &lt; j, is a comparison between the difference array values, so each j only needs a count of earlier values.</p>
  </>} />
}
