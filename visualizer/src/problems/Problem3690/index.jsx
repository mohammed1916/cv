import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The start state is queued at depth 0.' },
    { id: 'visit', label: 'Visit', description: 'Expand a state by moving one subarray.' },
    { id: 'found', label: 'Found', description: 'A move produces the target arrangement.' },
    { id: 'done', label: 'Result', description: 'Report the minimum number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (equal length, 2 to 6, permutation)',
  url: 'https://leetcode.com/problems/split-and-merge-array-transformation/',
  complexity: 'Breadth-first search over distinct arrangements, at most 6! states. The visualization caps length at 6.',
  examples: [
    { label: 'One move', input: '{"nums1":[2,3,1,4],"nums2":[1,4,2,3]}' },
    { label: 'Three moves', input: '{"nums1":[1,2,3,4,5],"nums2":[5,4,3,2,1]}' },
    { label: 'Two values swapped', input: '{"nums1":[2,1],"nums2":[1,2]}' },
    { label: 'Already matching', input: '{"nums1":[1,2,3],"nums2":[1,2,3]}' },
    { label: 'Duplicate values', input: '{"nums1":[2,2,1],"nums2":[1,2,2]}' },
    { label: 'Long run: 6 values', input: '{"nums1":[-44,4,-11,37,15,-38],"nums2":[4,37,15,-44,-38,-11]}' },
  ],
}

export default function SplitAndMergeArrayTransformation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Current array" length={step.array.length} valueAt={i => step.array[i]} active={-1}
      roleAt={i => (step.array[i] === step.target[i] ? 'match' : '')} />
    <IndexedSequence label="Target array" length={step.target.length} valueAt={i => step.target[i]} active={-1} />
    <output aria-label="Operation count">{`depth ${step.depth}, ${step.ok === true ? 'target reached' : step.ok === false ? 'unreachable' : 'searching'} for ${run.input.nums1.length} values`}</output>
  </>} renderReasoning={() => <>
    <p>An operation cuts one contiguous block out of the array and reinserts it somewhere else. Breadth-first search tries all single operations first, so the first time the target appears, its depth is the minimum.</p>
    <p>A set of seen arrangements prevents expanding the same state twice.</p>
  </>} />
}
