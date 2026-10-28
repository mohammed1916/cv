import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no score.' },
    { id: 'start-cut', label: 'Start cut', description: 'Rotate the cycle so a cut is at the start, then split the line.' },
    { id: 'done', label: 'Complete', description: 'Report the best score over all starts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k, for example {"nums":[1,2,3,3],"k":2}',
  url: 'https://leetcode.com/problems/maximize-cyclic-partition-score/',
  complexity: 'O(n^4) time for the dynamic programme over n starts. The visualization caps the array at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,3],"k":2}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,3],"k":1}' },
  ],
}

export default function CyclicPartitionScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.start} />
    <output aria-label="Best">{`Start: ${step.start < 0 ? '-' : step.start}. Best score so far: ${step.best}. At most ${run.input.k} arcs.`}</output>
  </>} renderReasoning={() => <>
    <p>On a circle, an arc may wrap around. Any partition has a cut, so rotating the array to begin right after that cut turns it into a line.</p>
    <p>On each line, a dynamic programme chooses at most k pieces that maximize the sum of their ranges.</p>
  </>} />
}
