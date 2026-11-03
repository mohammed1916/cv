import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Line both arrays up in order.' },
    { id: 'candidate', label: 'Candidate', description: 'Pick which nums2 value is the appended copy.' },
    { id: 'done', label: 'Result', description: 'Keep the cheapest candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (nums2 has one more value)',
  url: 'https://leetcode.com/problems/minimum-operations-to-transform-array/description/',
  complexity: 'O(n^2) for the visualization; sorting plus prefix sums would make it O(n log n).',
  examples: [
    { label: 'Example', input: '{"nums1":[2,8],"nums2":[1,3,7]}' },
    { label: 'Single value', input: '{"nums1":[5],"nums2":[5,5]}' },
  ],
}

export default function MinimumOperationsToTransformArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums2 sorted" length={run.input.nums2.length} valueAt={i => [...run.input.nums2].sort((x, y) => x - y)[i]}
      active={step.target >= 0 ? step.target : -1} roleAt={i => (i === step.target ? 'appended' : '')} />
    <output aria-label="Operation total">{`best so far: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only one append is needed, and it copies a value already in nums1. Every other nums2 value is matched to a nums1 value by a single increase or decrease run.</p>
    <p>Sorting both arrays makes the cheapest pairing the one that matches neighbours in order.</p>
  </>} />
}
