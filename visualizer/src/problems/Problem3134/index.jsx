import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Work out the median position and set the search bounds.' },
    { id: 'probe', label: 'Count subarrays', description: 'Slide a window to count subarrays with at most the candidate distinct values.' },
    { id: 'done', label: 'Answer', description: 'Report the lower median.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 12 integers, 1 to 8) (JSON)',
  url: 'https://leetcode.com/problems/find-the-median-of-the-uniqueness-array/',
  complexity: 'O(n log n) time with a sliding window per probe. The visualization caps the input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3]}' },
    { label: 'Example 2', input: '{"nums":[3,4,3,4,5]}' },
  ],
}

export default function MedianUniquenessArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Distinct-count search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} />
    <output aria-label="Subarray count">{step.count === null ? `Target: ${step.target} subarrays` : `${step.count} subarrays of at most ${step.mid ?? step.lo} distinct values; target ${step.target}`}</output>
  </>} renderReasoning={() => <>
    <p>The uniqueness array is sorted, so its median is found by asking how many subarrays have at most v distinct values, for each v.</p>
    <p>A sliding window counts those subarrays in linear time, and the count only grows with v, so the smallest v that reaches the target is the median.</p>
  </>} />
}
