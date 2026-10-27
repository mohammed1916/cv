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
    <p>Fix two indices i and j. Over all k, the value (nums[i] AND nums[j]) OR nums[k] is an xor of terms that pair up and cancel, leaving the single values that the same argument reduces to.</p>
    <p>The end result is the xor of every element, computed in one pass.</p>
  </>} />
}
