import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total zero', description: 'Start the running total at zero.' },
    { id: 'add', label: 'Add window', description: 'Add the subarray that ends at this index.' },
    { id: 'done', label: 'Return', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON array of 1 to 12 integers from 1 to 1000)',
  url: 'https://leetcode.com/problems/sum-of-variable-length-subarrays/',
  complexity: 'O(n * maximum window) time for this visualization. A prefix-sum solution runs in O(n).',
  examples: [
    { label: 'Example 1', input: '[2,3,1]' },
    { label: 'Example 2', input: '[3,1,1,2]' },
  ],
}

export default function VariableSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i >= step.start && i <= step.index ? 'in window' : '')} />
    <output aria-label="Window state">{`${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Index i uses the subarray from max(0, i minus nums[i]) through i, so a larger value reaches further back.</p>
    <p>The answer is the sum of those subarray sums, one per index.</p>
  </>} />
}
