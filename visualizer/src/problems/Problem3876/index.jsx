import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Split', description: 'Group the values by parity.' },
    { id: 'compare', label: 'Compare', description: 'Compare the smallest odd and even values.' },
    { id: 'assign', label: 'Assign', description: 'Each even value subtracts the smallest odd.' },
    { id: 'done', label: 'Result', description: 'Report that a uniform array exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, a list of distinct integers',
  url: 'https://leetcode.com/problems/construct-uniform-parity-array-ii/',
  complexity: 'O(n) time and O(n) space for the constructed array.',
  examples: [
    { label: 'Odd helper works', input: '{"nums1":[3,6,9]}' },
    { label: 'Fails', input: '{"nums1":[5,4]}' },
    { label: 'Single value', input: '{"nums1":[7]}' },
    { label: 'Two values at the top', input: '{"nums1":[100,99]}' },
    { label: 'Mostly even run', input: '{"nums1":[2,4,6,8,10,12,14,16,18,20,22,24]}' },
    { label: 'Long run: 12 values', input: '{"nums1":[97,82,27,28,20,64,25,7,24,50,88,49]}' },
  ],
}

export default function ConstructUniformParityArrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i === step.index ? 'current' : '')} />
    <IndexedSequence label="nums2 so far" length={step.out.length} valueAt={i => step.out[i]} active={step.out.length - 1} />
    <output aria-label="Parity status">{step.result ? 'Result: true' : step.result === false ? 'Result: false' : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every even value must subtract an odd value strictly smaller than it, so the smallest odd value has to sit below the smallest even value.</p>
    <p>If one parity group is empty, every value already shares a parity.</p>
  </>} />
}
