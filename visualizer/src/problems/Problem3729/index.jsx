import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Runs', description: 'Group equal values into runs.' },
    { id: 'single', label: 'Single runs', description: 'Count subarrays made of one value.' },
    { id: 'pair', label: 'Run pairs', description: 'Count subarrays that span runs i to j.' },
    { id: 'done', label: 'Complete', description: 'Report the distinct count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a sorted nums and k, for example {"nums":[1,2,3],"k":3}',
  url: 'https://leetcode.com/problems/count-distinct-subarrays-divisible-by-k-in-sorted-array/',
  complexity: 'O(d^2 * c^2) time for d runs of counts up to c. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":3}' },
    { label: 'Example 2', input: '{"nums":[2,2,2,2,2,2],"k":6}' },
  ],
}

export default function DistinctDivisibleSorted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={-1} />
    <output aria-label="Total">{`k = ${run.input.k}. Distinct subarrays counted so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Because the array is sorted, equal values are adjacent. A distinct subarray is a sequence of values, so it is described by its runs.</p>
    <p>A sequence that spans several distinct values takes all of the middle runs, and only its first and last runs can be partial.</p>
  </>} />
}
