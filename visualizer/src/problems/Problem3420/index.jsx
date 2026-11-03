import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero.' },
    { id: 'fits', label: 'Fits', description: 'This subarray fits within k increments.' },
    { id: 'too-costly', label: 'Too costly', description: 'This subarray needs more than k increments.' },
    { id: 'done', label: 'Result', description: 'Report the number of subarrays that fit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 1 to 9) and k',
  url: 'https://leetcode.com/problems/count-non-decreasing-subarrays-after-k-operations/description/',
  complexity: 'O(n^2) subarrays with a linear cost check each. The visualization caps nums at 8 values.',
  examples: [
    { label: 'Invented run', input: JSON.stringify({ nums: [6, 3, 1, 2, 4, 4], k: 7 }) },
    { label: 'Tight budget', input: JSON.stringify({ nums: [2, 1, 3], k: 1 }) },
  ],
}

export default function CountNonDecreasingSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (step.at >= 0 && step.end !== undefined && i >= step.at && i <= step.end ? 'window' : '')} />
    <output aria-label="Subarray check">{`window ${step.at >= 0 ? `${step.at}..${step.end}` : 'none'}, cost ${step.cost ?? '-'} of budget ${run.input.k}, count ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Raising a value to the running maximum is the cheapest way to keep a run non-decreasing, because any lower choice breaks an earlier value.</p>
    <p>The total of those gaps is the cost of a subarray. Counting subarrays means checking each one against the budget.</p>
  </>} />
}
