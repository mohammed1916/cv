import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2447',
  phases: [
    { id: 'grow', label: 'Extend', description: 'Extend the subarray to the right and update its gcd.' },
    { id: 'hit', label: 'Match', description: 'The gcd equals k, so this subarray counts.' },
    { id: 'stop', label: 'Stop', description: 'The gcd fell below k, and a longer subarray cannot recover it.' },
    { id: 'done', label: 'Result', description: 'Return the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [6, 12, 3, 9], "k": 3}',
  url: 'https://leetcode.com/problems/number-of-subarrays-with-gcd-equal-to-k/',
  complexity: 'O(n^2 log V) time and O(1) extra space for values up to V. The early stop keeps the inner loop short.',
  examples: [
    { label: 'Example', input: '{"nums":[6,12,3,9],"k":3}' },
    { label: 'None', input: '{"nums":[4,8],"k":5}' },
    { label: 'Single value', input: '{"nums":[24],"k":24}' },
    { label: 'Equal values', input: '{"nums":[6,6,6,6],"k":6}' },
    { label: 'Largest values', input: '{"nums":[24,1,24,1,24,1,24,1,24,1,24,1],"k":24}' },
    { label: 'Long run: 12 values', input: '{"nums":[16,14,12,20,13,9,1,14,20,22,20,23],"k":15}' },
  ],
}

export default function GcdSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.r}
        roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="gcd">{step.l >= 0 ? `gcd of ${step.l}..${step.r} is ${step.g}; target ${run.input.k}` : `count ${step.count}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>For a fixed start, the gcd only shrinks as the subarray grows, and it always divides the earlier gcd. So once it drops below k, no longer subarray from that start can equal k.</p>
  </>} />
}
