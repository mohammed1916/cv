import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sets', description: 'Prepare a set for each array.' },
    { id: 'first', label: 'nums1 entries', description: 'Check each nums1 entry against nums2.' },
    { id: 'second', label: 'nums2 entries', description: 'Check each nums2 entry against nums1.' },
    { id: 'done', label: 'Answer', description: 'Return both counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two arrays as JSON: {"nums1": [...], "nums2": [...]}',
  url: 'https://leetcode.com/problems/find-common-elements-between-two-arrays/',
  complexity: 'O(n + m) time and O(n + m) space with two sets. The visualization caps each array at 20 numbers.',
  examples: [
    { label: 'Own case 1', input: '{"nums1":[5,4,3,4,2],"nums2":[3,3,6,3,4,7]}' },
    { label: 'Own case 2', input: '{"nums1":[4,5,3,4],"nums2":[2,6]}' },
    { label: 'Nothing shared', input: '{"nums1":[4],"nums2":[9]}' },
    { label: 'Equal lists', input: '{"nums1":[7,7],"nums2":[7,7]}' },
    { label: 'Extreme values', input: '{"nums1":[50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1],"nums2":[1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50]}' },
    { label: 'Long run: 20 values each', input: '{"nums1":[39,1,33,18,44,49,26,20,28,49,9,16,49,1,12,21,22,32,29,27],"nums2":[36,8,44,13,26,33,30,31,6,48,22,10,30,8,7,41,24,32,10,11]}' },
  ],
}

export default function CommonElementCounts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} active={step.side === 'nums1' ? step.index : -1} />
    <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]} active={step.side === 'nums2' ? step.index : -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Counts so far">{step.result ? `Counts: [${step.result.map(v => (v === null ? '…' : v)).join(', ')}]` : 'Counts not ready yet'}</output>
  </>} renderReasoning={() => <>
    <p>Each array is turned into a set, so “is this value in the other array?” is a single lookup.</p>
    <p>The two answers count entries, not distinct values, so a repeated entry counts every time it appears.</p>
  </>} />
}
