import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2401',
  phases: [
    { id: 'shrink', label: 'Shrink', description: 'Drop the left value until the new value shares no bit with the window.' },
    { id: 'grow', label: 'Grow', description: 'Add the value to the window and record its length.' },
    { id: 'done', label: 'Result', description: 'Return the longest window seen.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 6, 9, 16, 2]}',
  url: 'https://leetcode.com/problems/longest-nice-subarray/',
  complexity: 'O(n) time and O(1) extra space. The window keeps the OR of its values, and each pointer moves right at most n times.',
  examples: [
    { label: 'Example', input: '{"nums":[1,6,9,16,2]}' },
    { label: 'Single', input: '{"nums":[3,1,5,11,13]}' },
  ],
}

export default function LongestNiceSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.r}
      roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Bits used by the window">{`bits in use ${step.used.toString(2).padStart(6, '0')}`}</output>
    <output aria-label="Longest">{`longest ${step.best}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A subarray is nice when no two of its values share a set bit. Keep the OR of the window: a new value is allowed exactly when it shares no bit with that OR.</p>
    <p>When the new value clashes, remove values from the left by XOR-ing them out of the OR. Since each value is only in the window once, the OR stays exact.</p>
  </>} />
}
