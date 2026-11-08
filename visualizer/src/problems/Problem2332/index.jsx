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
    { label: 'Own case 1', input: '{"buses":[11,21],"passengers":[3,18,19,20],"capacity":3}' },
    { label: 'Own case 2', input: '{"buses":[21,31,11],"passengers":[20,14,27,5,26,12,22],"capacity":3}' },
    { label: 'One bus, one passenger', input: '{"buses":[10],"passengers":[10],"capacity":1}' },
    { label: 'Passenger arrives at a bus time', input: '{"buses":[10,10],"passengers":[10,10],"capacity":2}' },
    { label: 'Largest input: 10 buses, 20 passengers', input: '{"buses":[2,11,20,29,38,47,56,65,74,83],"passengers":[2,6,10,14,18,22,26,30,34,38,42,46,50,54,58,62,66,70,74,78],"capacity":5}' },
    { label: 'Long run: 10 buses, 20 passengers', input: '{"buses":[15,81,57,100,59,30,53,12,84,56],"passengers":[89,73,66,53,47,46,87,77,69,63,15,7,39,48,79,58,62,44,5,71],"capacity":3}' },
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
