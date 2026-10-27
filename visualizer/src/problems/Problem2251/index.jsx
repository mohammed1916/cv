import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the start times and the end times separately.' },
    { id: 'person', label: 'Arrival', description: 'Count starts at or before the arrival and ends strictly before it.' },
    { id: 'done', label: 'Complete', description: 'Return the count for each person.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Flowers [start, end] and arrival times (JSON)',
  url: 'https://leetcode.com/problems/number-of-flowers-in-full-bloom/',
  complexity: 'O((F + P) log F) time with binary search. The visualization caps input at 10 flowers and 10 arrivals.',
  examples: [
    { label: 'Example 1', input: '{"flowers":[[1,6],[3,7],[9,12],[4,13]],"people":[2,3,7,11]}' },
    { label: 'Example 2', input: '{"flowers":[[1,10],[3,3]],"people":[3,3,2]}' },
  ],
}

export default function FlowersInBloom() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Arrival times (people)" length={run.input.people.length} active={step.person}
      valueAt={i => (step.answer[i] === undefined ? `t = ${run.input.people[i]}` : step.answer[i])} />
    <output aria-label="Starts and ends">{`Started: ${step.started}, ended before arrival: ${step.ended}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Flowers that started by time t minus flowers that ended before t gives the flowers in bloom, because every flower that has ended before t has also started by t.</p>
  </>} />
}
