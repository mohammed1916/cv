import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2036',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array (JSON)',
  url: 'https://leetcode.com/problems/maximum-alternating-subarray-sum/',
  complexity: 'O(n) time and O(1) extra space: two running states.',
  examples: [
    { label: 'Dip and rise', input: '[5,-2,4,1]' },
    { label: 'Single large', input: '[-1,9,-3]' },
    { label: 'Descending', input: '[9,8,7]' },
  ],
}

export default function MaximumAlternatingSubarraySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, index, plusEnd, minusEnd, best } = step.snapshot
    return <>
      <IndexedSequence label="Values" length={nums.length} valueAt={i => nums[i]} active={index} roleAt={i => (i % 2 === 0 ? '+ position' : '- position')} />
      <p>Best sum ending with a plus: <strong>{plusEnd}</strong>. Best sum ending with a minus: <strong>{minusEnd}</strong>. Overall best: <strong>{best}</strong>.</p>
    </>
  }} renderReasoning={() => <p>Signs alternate inside a subarray, so each position is either a plus or a minus. Two running states carry the best alternating sums ending with each sign.</p>} />
}
