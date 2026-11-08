import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Before midnight', input: '{"arrivalTime":9,"delayedTime":4}' },
    { label: 'Wraps', input: '{"arrivalTime":21,"delayedTime":6}' },
    { label: 'Smallest values', input: '{"arrivalTime":1,"delayedTime":1}' },
    { label: 'Largest values', input: '{"arrivalTime":23,"delayedTime":24}' },
    { label: 'Exactly 24 hours later', input: '{"arrivalTime":12,"delayedTime":12}' },
  ],
}

export default function CalculateDelayedArrivalTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arrivalTime, delayedTime } = run.input
    const reached = step.total
    const roleAt = hour => {
      if (hour === arrivalTime) return 'arrival'
      if (step.phase === 'wrap' || step.phase === 'done') return hour === reached && reached !== arrivalTime ? 'arrives' : ''
      return ''
    }
    return <section aria-label="24-hour clock">
      <IndexedSequence label="24-hour clock" length={24} active={reached ?? arrivalTime} valueAt={hour => `${hour}:00`} roleAt={roleAt} />
      <output aria-label="Clock reading">{`arrival ${arrivalTime} + delay ${delayedTime} = ${arrivalTime + delayedTime}${arrivalTime + delayedTime >= 24 ? `, wrapped to ${reached}` : ''}`}</output>
    </section>
  }} renderReasoning={() => <>
    <p>The train arrives at the station after adding the delay to the arrival hour.</p>
    <p>A time past 23 wraps around midnight, so the answer is the sum taken modulo 24.</p>
  </>} />
}
