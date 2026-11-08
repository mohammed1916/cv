import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subarray has been tested yet.' },
    { id: 'extend', label: 'Extend', description: 'Extend the subarray and compare product with lcm times gcd.' },
    { id: 'done', label: 'Complete', description: 'Report the longest subarray that matched.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/maximum-subarray-with-equal-products/',
  complexity: 'O(n^2) time with exact arithmetic. The visualization caps n at 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1,2,1,1,1]}' },
    { label: 'Example 2', input: '{"nums":[2,3,4,5,6]}' },
    { label: 'Smallest pair', input: '{"nums":[1,2]}' },
    { label: 'Equal values tie', input: '{"nums":[6,6,6,6]}' },
    { label: 'Largest values: 30 twelves', input: '{"nums":[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12]}' },
    { label: 'Long run: 30 items', input: '{"nums":[8,12,6,1,1,4,3,6,6,11,11,12,11,5,9,11,6,2,5,10,8,10,4,4,6,5,9,11,6,1]}' },
  ],
}

export default function EqualProducts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inWindow = index => step.start >= 0 && index >= step.start && index <= step.end
    return <>
      <IndexedSequence label="Numbers" length={run.input.nums.length} active={step.end}
        valueAt={index => run.input.nums[index]}
        roleAt={index => (inWindow(index) ? (step.equal ? 'match' : 'window') : '')} />
      <output aria-label="Subarray check">{step.start < 0 ? 'Waiting' : `Product ${step.product}, gcd ${step.gcd}, lcm ${step.lcm}: ${step.equal ? 'equal' : 'not equal'}. Best ${step.best}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The product of a subarray equals the product of its LCM and GCD exactly when every prime exponent splits as maximum plus minimum.</p>
    <p>Tracking the product, GCD and LCM while extending one end at a time avoids checking subarrays separately.</p>
  </>} />
}
