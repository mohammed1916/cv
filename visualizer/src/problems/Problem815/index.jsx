import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

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
  parse: parseInput, build: buildTrace, code, inputLabel: 'Object {routes, source, target} (JSON)',
  url: 'https://leetcode.com/problems/bus-routes/',
  complexity: 'O(total stops across routes) time and space; each bus is boarded once and each stop enqueued once.',
  examples: [
    { label: 'Example 1', input: '{"routes":[[1,2,7],[3,6,7]],"source":1,"target":6}' },
    { label: 'Example 2 (unreachable)', input: '{"routes":[[7,12],[4,5,15],[6],[15,19],[9,12,13]],"source":15,"target":12}' },
    { label: 'Three buses', input: '{"routes":[[1,2],[2,3],[3,4]],"source":1,"target":4}' },
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
