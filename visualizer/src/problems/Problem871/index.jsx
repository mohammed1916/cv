import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Start with the initial fuel.' },
    { id: 'drive', label: 'Drive', description: 'Consume fuel to reach the next point.' },
    { id: 'refuel', label: 'Refuel', description: 'Use the largest passed station to stay alive.' },
    { id: 'push', label: 'Remember station', description: 'Add its fuel to the max-heap.' },
    { id: 'done', label: 'Complete', description: 'Stops needed, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {target, startFuel, stations} (JSON, up to 25 stations)',
  url: 'https://leetcode.com/problems/minimum-number-of-refueling-stops/',
  complexity: 'O(n log n) with a max-heap of passed stations.',
  examples: [
    { label: 'Official example 3', input: '{"target":100,"startFuel":10,"stations":[[10,60],[20,30],[30,30],[60,40]]}' },
    { label: 'No stations needed', input: '{"target":1,"startFuel":1,"stations":[]}' },
    { label: 'Impossible', input: '{"target":100,"startFuel":1,"stations":[[10,100]]}' },
    { label: 'Several stops', input: '{"target":200,"startFuel":50,"stations":[[30,20],[60,40],[90,30],[120,60],[150,20]]}' },
  ],
}

export default function MinRefuelStops() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pts = run.points
    return <>
      <IndexedSequence label="Positions along the road (last = target)" length={pts.length} active={step.index} valueAt={i => pts[i][0]} roleAt={i => i === pts.length - 1 ? 'right' : i < step.index ? 'written' : ''} />
      <IndexedSequence label="Fuel offered at each position" length={pts.length} active={step.index} valueAt={i => pts[i][1]} />
      <StackLane title="Max-heap of passed stations' fuel (largest first)" items={step.heap ?? []} />
      <output aria-label="Fuel and stops">Fuel in tank: {step.fuel}; stops used: {step.stops}</output>
      {step.phase === 'done' && <output aria-label="Answer">Answer: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Lazy decision:</strong> we do not decide at a station whether to stop. We only note its fuel, and refuel from the biggest remembered station the moment the tank would go negative.</p>
    <p><strong>Why largest first:</strong> every passed station is equally reachable in hindsight, so the fewest stops come from taking the biggest tanks first.</p>
  </>} />
}
