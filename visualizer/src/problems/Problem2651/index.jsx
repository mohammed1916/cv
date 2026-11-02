import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the arrival hour and the delay.' },
    { id: 'sum', label: 'Add', description: 'Add the delay to the arrival hour.' },
    { id: 'wrap', label: 'Wrap', description: 'Reduce the hour modulo 24.' },
    { id: 'done', label: 'Result', description: 'Report the arrival hour on a 24-hour clock.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arrivalTime (1 to 23) and delayedTime (1 to 24)',
  url: 'https://leetcode.com/problems/calculate-delayed-arrival-time/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"arrivalTime":15,"delayedTime":5}' },
    { label: 'Example 2', input: '{"arrivalTime":13,"delayedTime":11}' },
  ],
}

export default function CalculateDelayedArrivalTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Clock reading">{`arrival ${run.input.arrivalTime} + delay ${run.input.delayedTime} = ${step.total ?? 'pending'} on the clock`}</output>
  </>} renderReasoning={() => <>
    <p>The train arrives at the station after adding the delay to the arrival hour.</p>
    <p>A time past 23 wraps around midnight, so the answer is the sum taken modulo 24.</p>
  </>} />
}
