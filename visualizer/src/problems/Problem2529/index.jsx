import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The array is sorted, so the sign boundaries can be searched.' },
    { id: 'negative', label: 'Negatives', description: 'Find where the negative values end.' },
    { id: 'positive', label: 'Positives', description: 'Find where the positive values begin.' },
    { id: 'done', label: 'Complete', description: 'Return the larger of the two counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"nums": [...]} sorted non-decreasing',
  url: 'https://leetcode.com/problems/maximum-count-of-positive-integer-and-negative-integer/',
  complexity: 'Two binary searches on a sorted array: O(log n). The visualization caps input at 10 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[-2,-1,-1,1,2,3]}' },
    { label: 'Example 2', input: '{"nums":[-3,-2,-1,0,0,1,2]}' },
  ],
}

export default function MaximumCountSigns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (sorted)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => (run.input.nums[i] < 0 ? 'negative' : run.input.nums[i] > 0 ? 'positive' : 'zero')} />
    <output aria-label="Counts">{`Negatives ${step.negative ?? '-'}; positives ${step.positive ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Zeros are neither positive nor negative, and in a sorted array the negatives form a prefix while the positives form a suffix.</p>
    <p>Two binary searches find both boundaries, so the answer does not need to scan every value.</p>
  </>} />
}
