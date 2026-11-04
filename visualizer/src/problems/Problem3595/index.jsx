import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BitCounterView from './BitCounterView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: one value once, one value twice, the rest three times',
  url: 'https://leetcode.com/problems/once-twice/',
  complexity: 'O(n) time with two passes and O(1) extra space: six integers. The official length is up to 100,000; the visualization caps nums at 24 entries.',
  examples: [
    { label: 'Shared bits cancel', input: '{"nums":[5,9,7,9,7,9]}' },
    { label: 'No shared bits', input: '{"nums":[12,6,12,12,1,6]}' },
    { label: 'Negative and zero', input: '{"nums":[0,-2,4,-2,4,4]}' },
    { label: 'Smallest size', input: '{"nums":[8,2,2]}' },
  ],
}

export default function OnceTwice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BitCounterView run={run} step={step} />} renderReasoning={() => <>
    <p>Treat each bit position as a small counter that runs 0, 1, 2, 0. Values seen three times add a multiple of 3 to every column, so they erase themselves. Only the two special values leave anything behind.</p>
    <p>A column can still mislead. If both special values have a 1 there, the counts are 1 and 2, the total is 3 and the column reads 0. So one pass only reveals where the two values differ, not the values themselves.</p>
    <p>That is enough. Pick one differing bit and split the array by it. Equal values stay together, so each group keeps its triples and exactly one special value. Nothing can cancel inside a group: the once value appears in that group's ones mask and the twice value in its twos mask.</p>
  </>} />
}
