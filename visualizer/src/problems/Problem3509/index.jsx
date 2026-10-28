import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subsequence has been started.' },
    { id: 'consider', label: 'Extend', description: 'Each value starts or extends subsequences, keeping products within the limit.' },
    { id: 'done', label: 'Complete', description: 'Report the largest product with alternating sum k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums, k and limit, for example {"nums": [1,2,3], "k": 2, "limit": 10}',
  url: 'https://leetcode.com/problems/maximum-product-of-subsequences-with-an-alternating-sum-equal-to-k/',
  complexity: 'Pairs of alternating sum and product per step. The visualization caps nums at 16 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":2,"limit":10}' },
    { label: 'Example 2', input: '{"nums":[0,2,3],"k":-5,"limit":12}' },
    { label: 'Example 3', input: '{"nums":[2,2,3,3],"k":0,"limit":9}' },
  ],
}

export default function AlternatingProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} roleAt={index => (index < step.index ? 'used' : '')} />
    <output aria-label="Best product so far">{`Best product so far for alternating sum ${run.input.k}: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The alternating sum adds the first chosen value, subtracts the second, adds the third, and so on.</p>
    <p>Products only grow, so anything above the limit can be dropped, and the answer is the largest surviving product whose alternating sum is k.</p>
  </>} />
}
