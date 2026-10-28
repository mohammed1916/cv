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
    { label: 'Example 1', input: '{"nums1":[4,3,2,3,1],"nums2":[2,2,5,2,3,6]}' },
    { label: 'Example 2', input: '{"nums1":[3,4,2,3],"nums2":[1,5]}' },
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
