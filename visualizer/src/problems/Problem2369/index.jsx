import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix is always a valid partition.' },
    { id: 'position', label: 'Extend prefix', description: 'Check whether a pair or triple ending here extends a valid prefix.' },
    { id: 'done', label: 'Complete', description: 'Report whether the whole array can be partitioned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, 2 to 10 values from 1 to 6 (JSON)',
  url: 'https://leetcode.com/problems/check-if-there-is-a-valid-partition-for-the-array/',
  complexity: 'O(n) time and O(n) space for n values. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,4,4,5,6]}' },
    { label: 'Example 2', input: '{"nums":[1,1,1,2]}' },
  ],
}

export default function ValidPartitionArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.position - 1} roleAt={i => (step.ok[i + 1] ? 'valid prefix' : '')} />
    <output aria-label="Prefix">{step.position === 0 ? 'Empty prefix is valid' : `Prefix of ${step.position}: ${step.ok[step.position] ? 'valid' : 'not valid'}`}</output>
  </>} renderReasoning={() => <>
    <p>A valid partition uses pieces of exactly two equal values or three values that are all equal or consecutive.</p>
    <p>Each prefix is valid when a piece of length two or three ends at it and the prefix before that piece is valid.</p>
  </>} />
}
