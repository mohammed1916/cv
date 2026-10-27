import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search bounds from 0 to the largest value.' },
    { id: 'probe', label: 'Check limit', description: 'Check that every prefix total fits within the candidate limit times its length.' },
    { id: 'done', label: 'Answer', description: 'Report the smallest maximum that can be reached.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 8 integers, 0 to 10) (JSON)',
  url: 'https://leetcode.com/problems/minimize-maximum-of-array/',
  complexity: 'O(n log(max value)) time. The visualization caps the input at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,7,1,6]}' },
    { label: 'Example 2', input: '{"nums":[10,1]}' },
  ],
}

export default function MinimizeMaximumOfArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Maximum search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.broke ? 'too large' : ''} />
  </>} renderReasoning={() => <>
    <p>Moves only shift value to the left. The final first element is at least the average of the prefix, so every prefix average is a lower bound on the maximum.</p>
    <p>The prefix averages are also achievable, so the answer is the largest prefix average rounded up, and a limit passes exactly when every prefix fits.</p>
  </>} />
}
