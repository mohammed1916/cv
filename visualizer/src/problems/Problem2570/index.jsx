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
    { label: 'Own case 1', input: '{"nums1":[[2,3],[3,4],[5,6]],"nums2":[[2,5],[4,3],[5,2]]}' },
    { label: 'Own case 2', input: '{"nums1":[[3,5],[4,7],[6,6]],"nums2":[[2,4],[5,4]]}' },
    { label: 'Single pair', input: '{"nums1":[[1,1]],"nums2":[[2,2]]}' },
    { label: 'Ids at the limits', input: '{"nums1":[[1,100],[10,1]],"nums2":[[1,1],[10,100]]}' },
    { label: 'Eight pairs sorted by id', input: '{"nums1":[[1,100],[2,100],[3,100],[4,100],[5,100],[6,100],[7,100],[8,100]],"nums2":[[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1]]}' },
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
