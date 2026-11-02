import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'The running total starts at zero.' },
    { id: 'left', label: 'Left end', description: 'Begin subarrays at this index with no values seen.' },
    { id: 'extend', label: 'Extend', description: 'Extend the subarray to the right and add its squared distinct count.' },
    { id: 'done', label: 'Result', description: 'Report the total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a list of 1 to 8 integers from 1 to 100',
  url: 'https://leetcode.com/problems/subarrays-distinct-element-sum-of-squares-ii/',
  complexity: 'This reference scans every subarray: O(n^2) time with a set per left end. The visualization caps nums at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,1]}' },
    { label: 'Example 2', input: '{"nums":[1,1]}' },
  ],
}

export default function SubarraysDistinctSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at >= 0 ? step.at : 0}
      roleAt={i => (step.left >= 0 && i >= step.left && i <= step.at ? 'window' : '')} />
    <output aria-label="Distinct count">{`subarray from ${step.left >= 0 ? step.left : '-'} has ${step.distinct} distinct, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Fix the left end, then extend the right end one value at a time. The set of values seen is exactly the distinct values of the current subarray.</p>
    <p>Each subarray contributes the square of its distinct count, so the running total adds that square at every right end.</p>
  </>} />
}
