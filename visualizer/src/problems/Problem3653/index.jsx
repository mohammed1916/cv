import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the original values.' },
    { id: 'multiply', label: 'Multiply', description: 'Each query multiplies every k-th index in its range.' },
    { id: 'done', label: 'Complete', description: 'XOR the final values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and queries ([l, r, k, v] per query)',
  url: 'https://leetcode.com/problems/xor-after-range-multiplication-queries-i/',
  complexity: 'O(total indices touched) time. The visualization caps nums at 12 values and queries at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1],"queries":[[0,2,1,4]]}' },
    { label: 'Example 2', input: '{"nums":[2,3,1,5,4],"queries":[[1,4,2,3],[0,2,1,2]]}' },
  ],
}

export default function XorAfterMultiplications() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Values" length={step.nums.length} valueAt={i => step.nums[i]} active={step.index}
      roleAt={i => (step.touched.includes(i) ? 'changed' : '')} />
    <output aria-label="Answer">{step.answer === null ? 'XOR not yet computed' : `XOR: ${step.answer}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each query touches the indices l, l + k, l + 2k, and so on up to r. Multiplication is done modulo 1000000007 at each touched index.</p>
  </>} />
}
