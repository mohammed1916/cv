import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the first pair of each list.' },
    { id: 'take1', label: 'From nums1', description: 'The id appears only in nums1.' },
    { id: 'take2', label: 'From nums2', description: 'The id appears only in nums2.' },
    { id: 'sum', label: 'Sum', description: 'The id appears in both lists, so add the values.' },
    { id: 'done', label: 'Complete', description: 'Report the merged list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 as [id, value] lists (JSON)',
  url: 'https://leetcode.com/problems/merge-two-2d-arrays-by-summing-values/',
  complexity: 'O(n + m) time and O(n + m) space.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[[1,2],[2,3],[4,5]],"nums2":[[1,4],[3,2],[4,1]]}' },
    { label: 'Example 2', input: '{"nums1":[[2,4],[3,6],[5,5]],"nums2":[[1,3],[4,3]]}' },
  ],
}

const label = pair => `${pair[0]}:${pair[1]}`

export default function MergeArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => label(run.input.nums1[i])} active={step.i}
      roleAt={i => (i < step.i ? 'used' : '')} />
    <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => label(run.input.nums2[i])} active={step.j}
      roleAt={i => (i < step.j ? 'used' : '')} />
    <output aria-label="Merged">{`Merged so far: ${step.merged.map(label).join(', ') || 'nothing yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Both lists are sorted by id, so the smaller current id is always the next id in the merged result.</p>
    <p>When the two current ids match, their values are added into one entry.</p>
  </>} />
}
