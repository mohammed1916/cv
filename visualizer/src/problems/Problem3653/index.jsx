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
    { label: 'Own case 2', input: '{"nums":[4,5,1,3,2],"queries":[[0,2,1,2],[1,4,2,3]]}' },
    { label: 'One value, one query', input: '{"nums":[7],"queries":[[0,0,1,2]]}' },
    { label: 'Equal values', input: '{"nums":[4,4,4],"queries":[[0,2,2,4]]}' },
    { label: 'Largest values and bounds', input: '{"nums":[100,1,100,1,100,1,100,1,100,1,100,1],"queries":[[0,11,12,100],[3,3,1,1]]}' },
    { label: 'Long run: 12 values, 8 queries', input: '{"nums":[39,61,84,100,77,45,75,23,63,77,73,65],"queries":[[10,10,3,4],[7,7,12,34],[5,8,5,91],[0,6,12,49],[1,5,3,90],[3,3,9,49],[2,8,11,90],[11,11,7,78]]}' },
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
