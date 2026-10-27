import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Whole array', description: 'Start with the full array; its first value is the root.' },
    { id: 'combine', label: 'Combine sides', description: 'Multiply the interleavings of the left and right sides by their own counts.' },
    { id: 'done', label: 'Complete', description: 'Subtract the original ordering.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values (JSON object with nums as distinct integers)',
  url: 'https://leetcode.com/problems/number-of-ways-to-reorder-array-to-get-same-bst/',
  complexity: 'O(n^2) time for the binomial table and O(n^2) recursion. The visualization caps input at 7 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3]}' },
    { label: 'Example 2', input: '{"nums":[3,4,5,1,2]}' },
  ],
}

export default function SameBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (step.segment.includes(run.input.nums[i]) ? (run.input.nums[i] === step.root ? 'root' : 'segment') : '')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the order of values matters for a binary search tree. The first value of any sub-array is the root that the tree forces.</p>
    <p>Smaller and larger values can be interleaved in any way that keeps each side in order, which is the binomial coefficient C(size - 1, left size).</p>
  </>} />
}
