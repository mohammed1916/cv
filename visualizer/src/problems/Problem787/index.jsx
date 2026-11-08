import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the priority queue with the source.' },
    { id: 'pop', label: 'Pop and expand', description: 'Take the cheapest state and record its flight count.' },
    { id: 'push', label: 'Push flight', description: 'Add the state reached by one more flight.' },
    { id: 'skip', label: 'Skip', description: 'Discard a dominated or over-limit state.' },
    { id: 'found', label: 'Destination', description: 'The first popped destination is the cheapest valid one.' },
    { id: 'done', label: 'Complete', description: 'Return the price or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Flights problem (JSON)',
  url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
  complexity: 'O(E k log(E k)) time worst case; visualization limited to 10 cities and 30 flights.',
  examples: [
    { label: 'k=1 -> 700', input: '{"n":4,"flights":[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]],"src":0,"dst":3,"k":1}' },
    { label: 'k=1 -> 200', input: '{"n":3,"flights":[[0,1,100],[1,2,100],[0,2,500]],"src":0,"dst":2,"k":1}' },
    { label: 'k=0 -> 500', input: '{"n":3,"flights":[[0,1,100],[1,2,100],[0,2,500]],"src":0,"dst":2,"k":0}' }, { label: 'Single flight', input: '{"n":2,"flights":[[0,1,5]],"src":0,"dst":1,"k":0}' }, { label: 'Equal-price routes', input: '{"n":3,"flights":[[0,1,10],[0,2,5],[2,1,5]],"src":0,"dst":1,"k":1}' }, { label: 'No route within k', input: '{"n":3,"flights":[[0,1,4]],"src":0,"dst":2,"k":0}' }, { label: 'Long run: 10 cities, 30 flights', input: '{"n":10,"flights":[[3,7,471],[6,7,3142],[8,3,8820],[9,7,7570],[6,2,6244],[3,9,4121],[9,1,323],[3,1,4706],[6,0,6200],[4,8,717],[8,7,8950],[5,3,9048],[7,5,7454],[3,0,7340],[9,0,2299],[1,2,3503],[3,2,8404],[9,5,4659],[2,9,1404],[6,9,2885],[2,5,6932],[3,8,7038],[9,4,1654],[2,3,6548],[2,8,3547],[5,0,9128],[4,5,6549],[7,0,8153],[9,3,3541],[2,4,5678]],"src":0,"dst":9,"k":4}' },
  ],
}
export default function CheapestFlights() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WeightedGraphView {...wgraphState({
      labels: Array.from({ length: run.input.n }, (_, i) => String(i)), edges: run.input.flights, directed: true, title: 'Flight graph (weights are prices; distance = cheapest price found so far, ignoring the stop limit)',
      dist: step.best, active: step.cur && step.phase !== 'push' ? step.cur[2] : -1, ops: step.ops,
      edgeStates: step.flight ? { [run.input.flights.findIndex(f => f[0] === step.flight[0] && f[1] === step.flight[1])]: 'active' } : {},
    }).wgraph} />
    <IndexedSequence label="Flights (from-to: price)" length={Math.max(run.input.flights.length, 1)} valueAt={i => run.input.flights[i] ? `${run.input.flights[i][0]}-${run.input.flights[i][1]}: ${run.input.flights[i][2]}` : '-'} />
    {step.heapState && <HeapView {...step.heapState} />}
    <IndexedSequence label="Fewest flights at expansion, per city" length={run.input.n} active={step.cur ? step.cur[2] : -1} valueAt={i => step.seen[i]} roleAt={i => i === run.input.src ? 'src' : i === run.input.dst ? 'dst' : ''} />
    {step.more > 0 && <p>... and {step.more} more queued state(s).</p>}
    <output aria-label="Answer">{step.phase === 'done' ? `Cheapest price: ${run.result}` : 'Searching...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A plain Dijkstra visited set would be wrong here: a pricier route with fewer flights may be the only one that stays within the stop limit. So the state is (city, flights used), and an earlier pop dominates only when it used no more flights.</p>
  </>} />
}
