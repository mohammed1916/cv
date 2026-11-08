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
    { label: 'Descending', input: '[9,8,7]' }, { label: "Single zero", input: "[0]" }, { label: "Equal values", input: "[7,7,7]" }, { label: "Extreme values", input: "[100000,-100000,100000]" }, { label: "Long run: 60 values", input: "[36714,98425,4346,63622,56258,-91246,-25185,86608,-4882,65230,-49984,-61994,-76342,11747,-7609,-14922,-49207,-24215,22392,78568,-48364,-3416,-21343,-46350,-76532,21502,-35691,-49405,-1845,36150,-67486,45784,-10870,43950,-85579,33701,1076,-39281,42617,-49460,80423,-60065,73206,80017,-65205,94277,-40352,-67954,-470,29081,81488,34898,-20616,53349,-18922,31442,43572,-16099,-88551,20131]" },
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
