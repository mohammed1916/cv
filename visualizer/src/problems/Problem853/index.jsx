import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order cars by starting position, nearest the target first.' },
    { id: 'time', label: 'Arrival time', description: 'Compute the time the car needs if unobstructed.' },
    { id: 'new', label: 'New fleet', description: 'The car arrives later than all fleets ahead, so it leads a new fleet.' },
    { id: 'merge', label: 'Merge', description: 'The car catches a fleet ahead and joins it.' },
    { id: 'done', label: 'Complete', description: 'Return the fleet count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {target, position, speed} (JSON)',
  url: 'https://leetcode.com/problems/car-fleet/',
  complexity: 'O(n log n) time for sorting, O(n) space. The visualization caps n at 30.',
  examples: [
    { label: 'Three cars, one fleet', input: '{"target":12,"position":[0,3,7],"speed":[4,2,1]}' },
    { label: 'Slow car first', input: '{"target":20,"position":[5,11,2],"speed":[1,3,2]}' },
    { label: 'Two cars at the goal', input: '{"target":9,"position":[1,6],"speed":[2,5]}' },
    { label: 'Single car', input: '{"target":10,"position":[3],"speed":[2]}' },
    { label: 'Equal speeds never catch up', input: '{"target":12,"position":[0,4],"speed":[2,2]}' },
    { label: 'Largest target and speeds', input: '{"target":1000000,"position":[0,999999],"speed":[1000000,1]}' },
    { label: 'Long run: 30 cars', input: '{"target":1000,"position":[701,487,756,24,803,924,485,521,362,960,8,835,173,299,149,798,775,650,774,140,886,648,665,3,531,604,873,347,529,106],"speed":[17,18,8,17,13,1,6,5,17,17,12,19,11,15,9,15,12,1,14,18,1,13,14,7,17,1,5,18,1,9]}' },
  ],
}

export default function CarFleet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cars sorted by position (nearest target first): position" length={run.cars.length} active={step.index} valueAt={i => run.cars[i].p} roleAt={i => (step.leaders.includes(i) ? 'left' : '')} />
    <IndexedSequence label="Speed" length={run.cars.length} active={step.index} valueAt={i => run.cars[i].s} />
    <IndexedSequence label="Arrival time alone (hours)" length={run.cars.length} active={step.index} valueAt={i => Number(((run.input.target - run.cars[i].p) / run.cars[i].s).toFixed(2))} />
    <output aria-label="Fleet count">Fleets: {step.fleets} | slowest arrival so far: {step.slowest}</output>
  </>} renderReasoning={() => <>
    <p>A car can never pass the car ahead, so once a car would arrive no later than the fleet ahead it merges and travels at that fleet's pace. Only a strictly later arrival time starts a new fleet.</p>
    <p>Arrival times are compared with exact integer cross-multiplication, so ties merge correctly.</p>
  </>} />
}
