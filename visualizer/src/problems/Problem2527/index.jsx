import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero.' },
    { id: 'fold', label: 'Fold in', description: 'Xor each value into the running beauty.' },
    { id: 'done', label: 'Complete', description: 'Report the xor-beauty.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (values 0 to 63), for example {"nums":[1,4]}',
  url: 'https://leetcode.com/problems/find-xor-beauty-of-array/',
  complexity: 'O(n) time and O(1) extra space. The formula replaces the O(n^3) triple enumeration.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,4]}' },
    { label: 'Example 2', input: '{"nums":[15,45,20,2,34,35,5,44,32,30]}' },
  ],
}

export default function XorBeauty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} roleAt={i => (i < step.index ? 'folded' : '')} />
    <output aria-label="Beauty">{`Running xor-beauty: ${step.beauty}`}</output>
  </>} renderReasoning={() => <>
    <p>Fix the first two indices. For each bit, the pairs (i, j) whose OR has that bit set are counted by parity, and that parity matches the bit in the xor of every element.</p>
    <p>So the answer is the xor of every element, computed in one pass. The folded cells show what has already been xored in.</p>
  </>} />
}
