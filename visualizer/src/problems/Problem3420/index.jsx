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
    { label: 'Invented run', input: JSON.stringify({ nums: [4, 1, 5, 2], k: 3 }) },
    { label: 'Tight budget', input: JSON.stringify({ nums: [5, 2, 6, 1], k: 2 }) },
    { label: 'Single value', input: '{"nums":[3],"k":0}' },
    { label: 'Equal values tie', input: '{"nums":[4,4,4],"k":2}' },
    { label: 'Extreme values, large budget', input: '{"nums":[1,9,1,9,1,9,1,9],"k":20}' },
    { label: 'Long run: 8 values', input: '{"nums":[6,4,4,7,4,4,8,8],"k":12}' },
  ],
}

export default function CountNonDecreasingSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (step.at >= 0 && i === step.at ? 'l' : step.at >= 0 && i === step.end ? 'r' : step.at >= 0 && i > step.at && i < step.end ? 'window' : '')} />
    {step.at >= 0 && <IndexedSequence label="raised to the running maximum (same window)" length={step.end - step.at + 1} indexOffset={step.at}
      valueAt={j => { let hi = -Infinity; for (let t = step.at; t <= step.at + j; t++) hi = Math.max(hi, run.input.nums[t]); return hi }}
      roleAt={() => ''} />}
    <output aria-label="Subarray check">{`window ${step.at >= 0 ? `${step.at}..${step.end}` : 'none'}, cost ${step.cost ?? '-'} of budget ${run.input.k}, count ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Raising a value to the running maximum is the cheapest way to keep a run non-decreasing, because any lower choice breaks an earlier value.</p>
    <p>The total of those gaps is the cost of a subarray. Counting subarrays means checking each one against the budget.</p>
  </>} />
}
