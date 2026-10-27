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
    { label: 'Example 1', input: '{"target":12,"position":[10,8,0,5,3],"speed":[2,4,1,1,3]}' },
    { label: 'Example 2', input: '{"target":10,"position":[3],"speed":[3]}' },
    { label: 'Example 3', input: '{"target":100,"position":[0,2,4],"speed":[4,2,1]}' },
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
