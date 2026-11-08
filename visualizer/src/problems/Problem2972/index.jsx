import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'prefix', label: 'Prefix', description: 'Find where the strictly increasing prefix ends.' },
    { id: 'suffix', label: 'Suffix', description: 'Find where the strictly increasing suffix starts.' },
    { id: 'pair', label: 'Count', description: 'For a kept prefix, count the valid starts of the kept suffix.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with positive nums array (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-incremovable-subarrays-ii/',
  complexity: 'O(n) time with two pointers. The visualization caps input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4]}' },
    { label: 'Example 2', input: '{"nums":[6,5,7,8]}' },
    { label: "Single value", input: '{"nums":[7]}' },
    { label: "Equal values", input: '{"nums":[3,3,3,3]}' },
    { label: "Largest value at both ends", input: '{"nums":[10,1,10,10,1]}' },
    { label: "Long run: 20 values", input: '{"nums":[9,3,9,1,8,2,7,6,6,7,4,1,5,10,4,10,7,5,4,5]}' },
  ],
}

export default function Incremovable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.j >= 0 ? step.j : step.i}
      roleAt={i => (i <= step.i ? 'prefix' : step.j >= 0 && i >= step.j ? 'suffix' : '')} />
    <output aria-label="Total">{`Prefix ends at ${step.i}${step.j >= 0 ? `, suffix starts at ${step.j}` : ''}.`}</output>
  </>} renderReasoning={() => <>
    <p>Removing a subarray leaves a prefix and a suffix. Both must be strictly increasing and the prefix end must be below the suffix start in value.</p>
    <p>For each prefix end, the valid suffix starts form a tail of the array, so one moving pointer counts them.</p>
  </>} />
}
