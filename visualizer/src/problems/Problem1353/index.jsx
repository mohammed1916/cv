import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order events by start day and walk the days in order.' },
    { id: 'attend', label: 'Attend', description: 'Attend the waiting event that ends soonest.' },
    { id: 'done', label: 'Complete', description: 'Report how many events were attended.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with events: an array of [startDay, endDay] pairs (days 1 to 30)',
  url: 'https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended/',
  complexity: 'O(n log n) time with a heap for the waiting events. The visualization caps input at 8 events.',
  examples: [
    { label: 'Example 1', input: '{"events":[[1,2],[2,3],[3,4]]}' },
    { label: 'Example 2', input: '{"events":[[1,2],[2,2],[3,4],[3,4]]}' },
  ],
}

export default function MaxEvents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted = run.input.events.map((e, i) => i).sort((a, b) => run.input.events[a][0] - run.input.events[b][0] || run.input.events[a][1] - run.input.events[b][1])
    return <>
      <IndexedSequence label="Events in start-day order" length={sorted.length} valueAt={i => JSON.stringify(run.input.events[sorted[i]])} active={sorted.indexOf(step.index)} roleAt={i => (step.attendedIdx.includes(sorted[i]) ? 'attended' : '')} />
      <output aria-label="Attended">{`Day ${step.day}. Attended: ${step.attended}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each day can host one event. Among the events open that day, attending the one that ends soonest never blocks a better choice later.</p>
    <p>A heap keeps the open events ordered by end day, so each day costs logarithmic time.</p>
  </>} />
}
