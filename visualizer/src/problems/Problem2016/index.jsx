import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2016',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array (JSON)',
  url: 'https://leetcode.com/problems/maximum-difference-between-increasing-elements/',
  complexity: 'O(n) time and O(1) extra space: one running minimum.',
  examples: [
    { label: 'Late rise', input: '[6,2,9,4]' },
    { label: 'Steady fall', input: '[8,6,4,2]' },
    { label: 'Dip and climb', input: '[3,1,7,2,8]' },
  ],
}

export default function MaximumDifferenceIncreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, l, r, minValue, best } = step.snapshot
    return <>
      <IndexedSequence label="Values in order" length={nums.length} valueAt={i => nums[i]} active={r}
        roleAt={i => (i === l ? 'l (smallest so far)' : '') + (i === r && i !== l ? 'r (current)' : '')} />
      <p>Smallest earlier value <strong>{minValue}</strong> at l = {l}; current r = {r}. Best difference: <strong>{best}</strong>.</p>
    </>
  }} renderReasoning={() => <p>The larger value must come later, so the best partner for each value is the smallest value before it. Tracking that minimum while scanning gives every candidate.</p>} />
}
