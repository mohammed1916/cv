import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Start with the initial fuel.' },
    { id: 'drive', label: 'Drive', description: 'Consume fuel to reach the next point.' },
    { id: 'refuel', label: 'Refuel', description: 'Use the largest passed station to stay alive.' },
    { id: 'push', label: 'Remember station', description: 'Add its fuel to the max-heap.' },
    { id: 'done', label: 'Complete', description: 'Stops needed, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {target, startFuel, stations} (JSON, up to 25 stations)',
  url: 'https://leetcode.com/problems/minimum-number-of-refueling-stops/',
  complexity: 'O(n log n) with a max-heap of passed stations.',
  examples: [
    { label: 'Three stations, fueled', input: '{"target":500,"startFuel":100,"stations":[[100,120],[250,80],[400,60]]}' },
    { label: 'No stations needed', input: '{"target":1,"startFuel":1,"stations":[]}' },
    { label: 'Impossible', input: '{"target":100,"startFuel":1,"stations":[[10,100]]}' },
    { label: 'Several stops', input: '{"target":200,"startFuel":50,"stations":[[30,20],[60,40],[90,30],[120,60],[150,20]]}' },
    { label: 'Target one, no fuel', input: '{"target":1,"startFuel":0,"stations":[]}' },
    { label: 'Equal fuel stations', input: '{"target":20,"startFuel":5,"stations":[[5,10],[10,10],[15,10]]}' },
    { label: 'Largest limits', input: '{"target":1000000000,"startFuel":1000000000,"stations":[]}' },
    { label: 'Long run: 25 stations', input: '{"target":10000,"startFuel":400,"stations":[[92,98],[224,118],[643,40],[1883,18],[2225,394],[2881,314],[3462,66],[3837,456],[4024,498],[4075,233],[4483,78],[4898,226],[4993,339],[5123,71],[5427,417],[5836,456],[6086,403],[6280,384],[6655,373],[6913,236],[7135,365],[7168,432],[7822,94],[8247,362],[9945,408]]}' },
  ],
}

export default function MinRefuelStops() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pts = run.points
    return <>
      <IndexedSequence label="Positions along the road (last = target)" length={pts.length} active={step.index} valueAt={i => pts[i][0]} roleAt={i => i === pts.length - 1 ? 'right' : i < step.index ? 'written' : ''} />
      <IndexedSequence label="Fuel offered at each position" length={pts.length} active={step.index} valueAt={i => pts[i][1]} />
      {step.heapState && <HeapView {...step.heapState} />}
      <output aria-label="Fuel and stops">Fuel in tank: {step.fuel}; stops used: {step.stops}</output>
      {step.phase === 'done' && <output aria-label="Answer">Answer: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Lazy decision:</strong> we do not decide at a station whether to stop. We only note its fuel, and refuel from the biggest remembered station the moment the tank would go negative.</p>
    <p><strong>Why largest first:</strong> every passed station is equally reachable in hindsight, so the fewest stops come from taking the biggest tanks first.</p>
  </>} />
}
