import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'plan', label: 'Plan', description: 'Pick one parity to aim for.' },
    { id: 'assign', label: 'Assign', description: 'Each slot keeps or subtracts.' },
    { id: 'done', label: 'Result', description: 'Report that a uniform array exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, a list of distinct integers',
  url: 'https://leetcode.com/problems/construct-uniform-parity-array-i/',
  complexity: 'O(n) time and O(n) space for the constructed array.',
  examples: [
    { label: 'Mixed', input: '{"nums1":[5,8,11]}' },
    { label: 'All even', input: '{"nums1":[6,10]}' },
    { label: 'Single value', input: '{"nums1":[42]}' },
    { label: 'Extreme values 1 and 100', input: '{"nums1":[1,100]}' },
    { label: 'Even run', input: '{"nums1":[2,4,6,8,10,12,14,16,18,20,22,24]}' },
    { label: 'Long run: 12 values', input: '{"nums1":[26,88,41,38,81,11,2,80,19,64,89,94]}' },
  ],
}

export default function ConstructUniformParityArrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i === step.index ? 'current' : '')} />
    <IndexedSequence label="nums2 so far" length={step.out.length} valueAt={i => step.out[i]} active={step.out.length - 1} />
    <output aria-label="Parity status">{step.result ? 'Result: true' : step.message}</output>
  </>} renderReasoning={() => <>
    <p>If an odd value exists, it can serve as a helper: every even value subtracts it and becomes odd, while odd values stay as they are.</p>
    <p>If no odd value exists, every value is already even and can stay put.</p>
  </>} />
}
