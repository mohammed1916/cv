import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack of segment maxima.' },
    { id: 'read', label: 'Read', description: 'Take the next value.' },
    { id: 'merge', label: 'Merge', description: 'Join the value to a larger segment on the stack.' },
    { id: 'push', label: 'Push', description: 'Start a new segment or record the merged maximum.' },
    { id: 'done', label: 'Complete', description: 'Report the number of segments.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, for example {"nums":[4,2,5,3,5]}',
  url: 'https://leetcode.com/problems/make-array-non-decreasing/',
  complexity: 'O(n) time and O(n) space. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,2,5,3,5]}' },
    { label: 'Example 2', input: '{"nums":[1,2,3]}' },
  ],
}

export default function NonDecreasingSegments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Stack">{`Segment maxima: [${step.stack.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation turns a segment into its maximum, so the final array is a partition into segments whose maxima must not decrease.</p>
    <p>A stack holds the maxima of the segments built so far. A new value that is smaller than the top must join the top segment, which makes the top the maximum of the merged segment.</p>
  </>} />
}
