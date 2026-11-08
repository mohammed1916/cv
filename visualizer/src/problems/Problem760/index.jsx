import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'index', label: 'Index nums2', description: 'Record each value’s positions in nums2.' },
    { id: 'map', label: 'Map a value', description: 'Take the next unused position of this value.' },
    { id: 'done', label: 'Complete', description: 'Report the mapping.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums1 and nums2 (JSON)',
  url: 'https://leetcode.com/problems/find-anagram-mappings/',
  complexity: 'O(n) time and space with a hash map. The visualization caps input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[12,28,46,32,50],"nums2":[50,12,32,46,28]}' },
    { label: 'Repeated', input: '{"nums1":[1,1,2],"nums2":[2,1,1]}' }, { label: 'Single value', input: '{"nums1":[7],"nums2":[7]}' }, { label: 'Extremes', input: '{"nums1":[-100,100,0],"nums2":[0,100,-100]}' }, { label: 'Long run: 20 values', input: '{"nums1":[-96,13,35,-88,-67,50,93,-54,96,14,81,81,-40,31,-14,86,-74,10,-51,75],"nums2":[-54,-14,35,81,-40,-88,31,75,-51,-74,-96,-67,81,50,86,10,96,14,13,93]}' },
  ],
}

export default function FindAnagramMappings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.nums1.length} active={step.i ?? -1} valueAt={i => run.nums1[i]}
      roleAt={i => (step.i !== null && i < step.i ? 'read' : '')} />
    <IndexedSequence label="nums2" length={run.nums2.length} active={step.index ?? -1} valueAt={i => run.nums2[i]}
      roleAt={i => (step.mapping.includes(i) ? 'read' : '')} />
    <output aria-label="Mapping">{`Mapping so far: [${step.mapping.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>A value can appear more than once, so each value keeps a list of its positions in nums2. Taking the next position from the list pairs each occurrence in nums1 with a different occurrence in nums2.</p>
    <p>The result is any valid mapping; here positions are used in order.</p>
  </>} />
}
