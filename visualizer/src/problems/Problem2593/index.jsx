import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Order', description: 'Order the positions by value, breaking ties by position.' },
    { id: 'take', label: 'Take and mark', description: 'Add the value, then mark the position and both neighbours.' },
    { id: 'skip', label: 'Skip', description: 'This position was already marked by an earlier take.' },
    { id: 'done', label: 'Complete', description: 'Report the final score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 12 integers from 1 to 100)',
  url: 'https://leetcode.com/problems/find-score-of-an-array-after-marking-all-elements/',
  complexity: 'O(n log n) time for the sort, O(n) space for the marks.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3,4,5,2]}' },
    { label: 'Example 2', input: '{"nums":[2,3,5,1,3,2]}' },
  ],
}

export default function FindScoreAfterMarking() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at ?? -1}
      roleAt={i => (step.marked.includes(i) ? 'marked' : '')} />
    <output aria-label="Score so far">{`Score so far: ${step.score}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting by value, then position, lets the walk see the smallest unmarked value first without rescanning.</p>
    <p>Marking the neighbours is what stops the next pick from touching a position that was just used.</p>
  </>} />
}
