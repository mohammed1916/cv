import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First value', description: 'The first copy value can be anywhere in its own bound.' },
    { id: 'narrow', label: 'Narrow', description: 'Each later position shifts the allowed range of the first value.' },
    { id: 'done', label: 'Complete', description: 'Count the first values that survive every bound.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with original and bounds (JSON)',
  url: 'https://leetcode.com/problems/find-the-number-of-copy-arrays/',
  complexity: 'O(n) time and O(1) space. The visualization caps the array at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"original":[1,2,3,4],"bounds":[[1,2],[2,3],[3,4],[4,5]]}' },
    { label: 'Example 2', input: '{"original":[1,2,3,4],"bounds":[[1,10],[2,9],[3,8],[4,7]]}' },
  ],
}

export default function CopyArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="original" length={run.input.original.length} valueAt={index => run.input.original[index]}
      active={step.index < run.input.original.length ? step.index : -1} />
    <output aria-label="Range">{`First copy value: ${step.low} to ${step.high}, count ${Math.max(0, step.high - step.low + 1)}`}</output>
  </>} renderReasoning={() => <>
    <p>A copy must keep every difference of the original, so each copy value is the first copy value plus a fixed shift.</p>
    <p>Each bound then limits the first value to an interval, and the answer is the size of the intersection of those intervals.</p>
  </>} />
}
