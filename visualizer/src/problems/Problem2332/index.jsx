import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the bus departures and the passenger arrivals.' },
    { id: 'bus', label: 'Board', description: 'Each bus takes the earliest waiting passengers up to its capacity.' },
    { id: 'answer', label: 'Candidate', description: 'Pick the latest arrival time that could board: the bus time, or just before the last boarded passenger.' },
    { id: 'scan', label: 'Scan', description: 'The boarded passenger arrives after the candidate, so there is no clash.' },
    { id: 'step', label: 'Step back', description: 'Your candidate time is taken by a passenger, so move one minute earlier.' },
    { id: 'done', label: 'Complete', description: 'Report the latest time you can arrive.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with buses, passengers and capacity',
  url: 'https://leetcode.com/problems/the-latest-time-to-catch-a-bus/',
  complexity: 'O(n log n + m log m) time for the sorts, O(1) extra space for the walk.',
  examples: [
    { label: 'Example 1', input: '{"buses":[10,20],"passengers":[2,17,18,19],"capacity":2}' },
    { label: 'Example 2', input: '{"buses":[20,30,10],"passengers":[19,13,26,4,25,11,21],"capacity":2}' },
  ],
}

export default function LatestTimeToCatchBus() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Passengers by arrival" length={run.sortedPassengers.length} valueAt={i => run.sortedPassengers[i]}
      roleAt={i => (i < step.boarded ? 'boarded' : '')} />
    <output aria-label="Bus status">{step.bus !== null ? `Bus ${step.bus} boards ${step.load} of ${run.input.capacity}. ` : ''}{`Candidate arrival: ${step.answer ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Passengers board greedily in arrival order, so the first passengers fill the earliest buses.</p>
    <p>You can board only if you arrive before someone who would take your seat, and you may not arrive at the same minute as a passenger.</p>
  </>} />
}
