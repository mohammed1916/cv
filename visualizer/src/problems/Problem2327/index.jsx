import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Day 1', description: 'One person learns the secret on day 1.' },
    { id: 'day', label: 'Each day', description: 'People past the delay and not yet forgotten share it.' },
    { id: 'done', label: 'Count', description: 'Add the people who still remember on the last day.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, delay, and forget (1 <= delay < forget <= n)',
  url: 'https://leetcode.com/problems/number-of-people-aware-of-a-secret/',
  complexity: 'O(n * forget) time and O(n) space. The visualization caps n at 40.',
  examples: [
    { label: 'Example 1', input: '{"n":6,"delay":2,"forget":4}' },
    { label: 'Example 2', input: '{"n":4,"delay":1,"forget":3}' },
  ],
}

export default function AwareOfSecret() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="People who learn the secret on each day (index 0 unused)" length={step.learned.length} valueAt={index => step.learned[index]} active={step.day} />
    <output aria-label="Step">{step.message}</output>
    {step.phase === 'done' && <output aria-label="Answer">Answer: {run.result}</output>}
  </>} renderReasoning={() => <>
    <p>A person who learns the secret on day d can share it from day d + delay until day d + forget - 1.</p>
    <p>Each day, the new learners are the sum over that window, so the table only needs the last forget days.</p>
  </>} />
}
