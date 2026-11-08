import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read routes, source and target.' },
    { id: 'index', label: 'Index stops', description: 'Map each stop to the buses serving it.' },
    { id: 'seed', label: 'Seed queue', description: 'Start at the source with 0 buses.' },
    { id: 'pop', label: 'Pop stop', description: 'Take the next stop from the BFS queue.' },
    { id: 'skip', label: 'Skip bus', description: 'A bus already boarded adds nothing.' },
    { id: 'board', label: 'Board bus', description: 'Enqueue every unseen stop on the bus.' },
    { id: 'found', label: 'Reached target', description: 'The boarded bus serves the target.' },
    { id: 'done', label: 'Complete', description: 'Return the minimum bus count or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object {routes, source, target} (JSON)',
  url: 'https://leetcode.com/problems/bus-routes/',
  complexity: 'O(total stops across routes) time and space; each bus is boarded once and each stop enqueued once.',
  examples: [
    { label: 'Example 1', input: '{"routes":[[1,2,7],[3,6,7]],"source":1,"target":6}' },
    { label: 'Example 2 (unreachable)', input: '{"routes":[[7,12],[4,5,15],[6],[15,19],[9,12,13]],"source":15,"target":12}' },
    { label: 'Three buses', input: '{"routes":[[1,2],[2,3],[3,4]],"source":1,"target":4}' },
    { label: 'One bus, direct', input: '{"routes":[[0,1]],"source":0,"target":1}' },
    { label: 'Two equal-length routes', input: '{"routes":[[1,2],[1,3],[2,4],[3,4]],"source":1,"target":4}' },
    { label: 'Stops at the id limit', input: '{"routes":[[0,99],[99,50,0]],"source":0,"target":99}' },
    { label: 'Long run: 8 routes of 8 stops', input: '{"routes":[[95,97,27,11,43,15,20,83],[52,95,59,39,73,10,35,86],[7,11,51,55,57,27,70,10],[79,39,30,57,62,16,3,10],[10,59,83,92,70,76,38,64],[48,5,42,96,4,23,17,1],[29,69,2,16,22,19,97,58],[90,59,31,57,67,92,7,42]],"source":95,"target":42}' },
  ],
}
export default function BusRoutes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bus routes (index = bus)" length={run.input.routes.length} active={step.bus} valueAt={i => `[${run.input.routes[i].join(',')}]`} roleAt={i => step.seenBuses.includes(i) ? 'boarded' : ''} />
    <StackLane title="BFS queue: stop@buses (front first)" items={step.queue.map(([s, d]) => `${s}@${d}`)} note={`source ${run.input.source}, target ${run.input.target}`} />
    <IndexedSequence label="Stops seen" length={step.seenStops.length} active={-1} valueAt={i => step.seenStops[i]} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why buses, not stops, are the cost:</strong> riding a bus is free between its stops, so every stop reachable from one boarding shares the same level. Boarding a bus once suffices, since the first time we see it is already at the smallest depth.</p>
  </>} />
}
