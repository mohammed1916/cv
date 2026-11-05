import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the search range from one to the largest value.' },
    { id: 'probe', label: 'Probe', description: 'Test the middle divisor against the threshold.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest divisor that fits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and threshold',
  url: 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/',
  complexity: 'O(n log max) time. The visualization caps input at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,5,9],"threshold":6}' },
    { label: 'Example 2', input: '{"nums":[44,22,33,11,1],"threshold":5}' },
  ],
}

export default function SmallestDivisor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={() => ''} />
    <AnswerRangeBar title="Divisor search" min={1} max={Math.max(...run.input.nums)} low={step.low} high={step.high} probe={step.mid}
      verdict={step.mid === null ? null : step.sum <= run.input.threshold} />
    <output aria-label="Search range">{step.mid === null ? `Range ${step.low} to ${step.high}` : `Range ${step.low} to ${step.high}, divisor ${step.mid} gives sum ${step.sum} against ${run.input.threshold}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each divisor is judged by the sum of ceiling quotients, which only falls as the divisor grows, so the first fitting divisor marks the boundary.</p>
  </>} />
}
