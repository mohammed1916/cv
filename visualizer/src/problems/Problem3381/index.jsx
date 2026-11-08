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
    { label: 'Six values, k three', input: '{"nums":[4,-6,9,-1,0,2],"k":3}' },
    { label: 'Extremes, k two', input: '{"nums":[-10,10,-3],"k":2}' },
    { label: 'Single value', input: '{"nums":[-3],"k":1}' },
    { label: 'Equal values', input: '{"nums":[2,2,2],"k":3}' },
    { label: 'Alternating extremes', input: '{"nums":[10,-10,10,-10,10,-10,10,-10,10,-10,10,-10],"k":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[-2,-10,-4,-7,-2,-4,10,-4,-1,10,-5,-4],"k":6}' },
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
