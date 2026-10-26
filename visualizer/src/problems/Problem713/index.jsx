import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty window', description: 'The window product starts at 1.' },
    { id: 'grow', label: 'Extend and shrink', description: 'Add the right value; shrink from the left while the product is too big.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/subarray-product-less-than-k/',
  complexity: 'O(n) time and O(1) extra space: each index enters and leaves the window once.',
  examples: [
    { label: 'Classic', input: '{"nums":[10,5,2,6],"k":100}' },
    { label: 'None', input: '{"nums":[1,2,3],"k":0}' },
  ],
}

export default function SubarrayProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} active={step.r} valueAt={i => run.input.nums[i]}
      roleAt={i => (i >= step.l && i <= step.r ? 'in-window' : '')} />
    <output aria-label="Window">Window [{step.l}, {step.r}] · product {Number(step.product.toFixed(6))} · count {step.count}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Counting trick:</strong> every subarray ending at r whose start lies in [l, r] is valid, so each step adds r − l + 1 at once.</p>
    <p>Target product below {run.input.k}.</p>
  </>} />
}
