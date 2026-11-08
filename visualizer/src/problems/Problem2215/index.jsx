import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import VennView from './VennView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2215',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums1 and nums2, e.g. {"nums1":[1,2,3,3],"nums2":[1,4,6]}',
  url: 'https://leetcode.com/problems/find-the-difference-of-two-arrays/',
  complexity: 'O(n + m) time with hash sets and O(n + m) space. The page caps each array at 10 values from 0 to 9.',
  examples: [
    { label: 'Partial overlap', input: '{"nums1":[1,2,3,3],"nums2":[1,4,6]}' },
    { label: 'Same values', input: '{"nums1":[5,5],"nums2":[5]}' },
    { label: 'Disjoint', input: '{"nums1":[0,9],"nums2":[7]}' },
    { label: 'Smallest input', input: '{"nums1":[0],"nums2":[0]}' },
    { label: 'Largest values', input: '{"nums1":[9,9,9,9,9,9,9,9,9,9],"nums2":[9,8,7,6,5,4,3,2,1,0]}' },
    { label: 'Long run: ten values', input: '{"nums1":[3,1,4,1,5,9,2,6,5,3],"nums2":[5,8,9,7,9,3,2,3,8,4]}' },
  ],
}

export default function Problem2215Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <VennView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
