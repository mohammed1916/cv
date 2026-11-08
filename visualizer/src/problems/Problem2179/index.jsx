import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TripletView from './TripletView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2179',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums1 and nums2 permutations, e.g. {"nums1":[0,1,2,3],"nums2":[0,2,1,3]}',
  url: 'https://leetcode.com/problems/count-good-triplets-in-an-array/',
  complexity: 'O(n^2) time in this visualization by checking each middle value against every value; the efficient solution uses a Fenwick tree in O(n log n). The page caps n at 8.',
  examples: [
    { label: 'Four values', input: '{"nums1":[2,0,1,3],"nums2":[0,1,2,3]}' },
    { label: 'Shuffled', input: '{"nums1":[4,0,1,3,2],"nums2":[4,1,0,2,3]}' },
    { label: 'Reversed order', input: '{"nums1":[0,1,2],"nums2":[2,1,0]}' },
    { label: 'Three values, identity', input: '{"nums1":[0,1,2],"nums2":[0,1,2]}' },
    { label: 'Same permutation twice', input: '{"nums1":[1,0,2],"nums2":[1,0,2]}' },
    { label: 'Four values, one swap', input: '{"nums1":[1,0,2,3],"nums2":[0,1,2,3]}' },
    { label: 'Largest size, reversed order', input: '{"nums1":[0,1,2,3,4,5,6,7],"nums2":[7,6,5,4,3,2,1,0]}' },
    { label: 'Long run: eight values', input: '{"nums1":[6,3,4,7,5,0,1,2],"nums2":[0,7,3,6,2,5,1,4]}' },
  ],
}

export default function Problem2179Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TripletView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
