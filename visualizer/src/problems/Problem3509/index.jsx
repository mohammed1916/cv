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
    { label: 'Five values, limit twelve', input: '{"nums":[5,0,3,9,2],"k":4,"limit":12}' },
    { label: 'Negative k with repeats', input: '{"nums":[1,1,2,8,0,6],"k":-2,"limit":7}' },
    { label: 'Sixteen values, limit sixty', input: '{"nums":[11,4,4,10,3,12,7,2,0,6,9,8,5,1,10,3],"k":3,"limit":60}' },
    { label: 'Single value', input: '{"nums":[5],"k":0,"limit":1}' },
    { label: 'Equal values tie', input: '{"nums":[3,3,3,3],"k":3,"limit":10}' },
    { label: 'Largest values and limit', input: '{"nums":[12,0,12,0,12,0,12,0,12,0,12,0,12,0,12,0],"k":100000,"limit":5000}' },
    { label: 'Negative k with zeros', input: '{"nums":[0,0,0],"k":-100000,"limit":1}' },
    { label: 'Long run: 16 values', input: '{"nums":[12,9,8,8,5,8,12,6,2,2,2,7,11,8,7,7],"k":7,"limit":5000}' },
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
