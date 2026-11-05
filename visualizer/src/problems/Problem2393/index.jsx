import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2393',
  phases: [
    { id: 'grow', label: 'Extend', description: 'The value is larger than its left neighbour, so the increasing run grows.' },
    { id: 'restart', label: 'Restart', description: 'The value is not larger, so only the one-element subarray starts a new run.' },
    { id: 'done', label: 'Result', description: 'Return the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 3, 5, 4, 7]}',
  url: 'https://leetcode.com/problems/count-strictly-increasing-subarrays/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '{"nums":[1,3,5,4,7]}' },
    { label: 'Flat', input: '{"nums":[2,2,2]}' },
  ],
}

export default function IncreasingSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.r}
      roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Count">{`${step.count} so far`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Every subarray that ends at r and is strictly increasing starts somewhere inside the current increasing run. If the run has length L, it contributes L subarrays ending at r.</p>
  </>} />
}
