import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero.' },
    { id: 'nums1', label: 'nums1 values', description: 'Decide whether nums1 values survive, by the length of nums2.' },
    { id: 'nums2', label: 'nums2 values', description: 'Decide whether nums2 values survive, by the length of nums1.' },
    { id: 'done', label: 'Complete', description: 'Report the xor of all pairings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2, for example {"nums1":[2,1,3],"nums2":[10,2,5,0]}',
  url: 'https://leetcode.com/problems/bitwise-xor-of-all-pairings/',
  complexity: 'O(n + m) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[2,1,3],"nums2":[10,2,5,0]}' },
    { label: 'Example 2', input: '{"nums1":[1,2],"nums2":[3,4]}' },
  ],
}

export default function PairingXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} roleAt={() => (step.phase === 'nums1' ? 'counted' : '')} />
    <IndexedSequence label="nums2" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]} roleAt={() => (step.phase === 'nums2' ? 'counted' : '')} />
    <output aria-label="Result">{`Running xor: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Each nums1 value is paired with every nums2 value, so it appears nums2.length times in the pairs. Equal copies cancel, so it survives only when nums2.length is odd.</p>
    <p>The same argument gives the nums2 values a survival test based on nums1.length.</p>
  </>} />
}
