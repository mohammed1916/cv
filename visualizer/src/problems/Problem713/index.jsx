import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty window', description: 'The window has no elements and product 1.' },
    { id: 'grow', label: 'Extend right', description: 'Add the element at r to the product.' },
    { id: 'shrink', label: 'Shrink left', description: 'Drop elements at l while the product reaches k.' },
    { id: 'count', label: 'Count windows', description: 'Every window ending at r is valid.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums and k (JSON object)',
  url: 'https://leetcode.com/problems/subarray-product-less-than-k/',
  complexity: 'O(n) time: l and r each move forward at most n times. O(1) extra space.',
  examples: [
    { label: 'Small window', input: '{"nums":[3,1,4,2],"k":10}' },
    { label: 'Tight', input: '{"nums":[2,5,3,1],"k":6}' },
    { label: 'None', input: '{"nums":[9,8],"k":2}' },
  ],
}

export default function SubarrayProductLessThanK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (window from l to r)" length={run.input.nums.length} active={step.r}
      valueAt={i => run.input.nums[i]}
      roleAt={i => (i === step.l && i <= step.r ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? 'window' : '')} />
    <output aria-label="Window state">{`l = ${step.l}, r = ${step.r}, product = ${step.product}, count = ${step.count}`}</output>
    <p>{`Target: product below ${run.input.k}.`}</p>
  </>} renderReasoning={() => <>
    <p>The window [l, r] always holds a product that is below k. Growing r may break that, so l moves right until it holds again.</p>
    <p>Once a window ending at r is valid, every shorter window that ends at r and starts later is valid too, so r - l + 1 subarrays are counted at once.</p>
  </>} />
}
