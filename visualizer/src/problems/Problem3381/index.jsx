import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Record prefix index 0 in residue class 0.' },
    { id: 'scan', label: 'Scan ends', description: 'For each end, compare against the lowest earlier prefix in the same residue class.' },
    { id: 'done', label: 'Complete', description: 'Report the best sum found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (1 to 12 integers from -10 to 10) and k (1 to the length of nums)',
  url: 'https://leetcode.com/problems/maximum-subarray-sum-with-length-divisible-by-k/',
  complexity: 'O(n + k) time and O(k) space. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2],"k":1}' },
    { label: 'Example 2', input: '{"nums":[-5,1,2,-3,4],"k":2}' },
  ],
}

export default function MaximumSubarraySumDivisibleByK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => step.range && index >= step.range[0] && index <= step.range[1] ? 'best' : ''} />
    <output aria-label="Candidate">{`Candidate ${step.candidate ?? '(none)'}, best ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray from prefix index i to prefix index e has a length divisible by k exactly when i and e have the same residue modulo k.</p>
    <p>For each residue class only the smallest earlier prefix sum matters, because it gives the largest subarray sum ending at e.</p>
  </>} />
}
