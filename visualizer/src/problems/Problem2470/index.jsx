import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2470',
  phases: [
    { id: 'grow', label: 'Extend', description: 'Extend the subarray to the right and update its LCM.' },
    { id: 'hit', label: 'Match', description: 'The LCM equals k, so this subarray counts.' },
    { id: 'stop', label: 'Stop', description: 'A value that does not divide k makes every longer subarray wrong.' },
    { id: 'done', label: 'Result', description: 'Return the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [3, 6, 2, 7, 1], "k": 6}',
  url: 'https://leetcode.com/problems/number-of-subarrays-with-lcm-equal-to-k/',
  complexity: 'O(n^2 log V) time and O(1) extra space. A value that does not divide k ends the inner loop.',
  examples: [
    { label: 'Example', input: '{"nums":[3,6,2,7,1],"k":6}' },
    { label: 'Pair', input: '{"nums":[2,4],"k":4}' },
    { label: 'Single value', input: '{"nums":[3],"k":1}' },
    { label: 'Equal values', input: '{"nums":[6,6,6,6],"k":12}' },
    { label: 'Largest values', input: '{"nums":[12,1,12,1,12,1,12,1,12,1],"k":24}' },
    { label: 'Long run: 10 values', input: '{"nums":[2,6,5,5,3,6,4,8,9,11],"k":19}' },
  ],
}

export default function LcmSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.r}
        roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="LCM">{step.l >= 0 ? `LCM ${step.lcm}, target ${run.input.k}` : `count ${step.count}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>If a value does not divide k, no subarray containing it can have LCM k, since the LCM would then be a multiple of that value and cannot equal k.</p>
    <p>Otherwise every LCM along the way divides k, so grow the subarray and compare its LCM with k.</p>
  </>} />
}
