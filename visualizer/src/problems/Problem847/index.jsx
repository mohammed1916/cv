import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { edgesFromAdjacency } from '../../components/shared/graphTraversalModel'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Seed the queue with every single-node state.' },
    { id: 'pop', label: 'Pop state', description: 'Take the oldest (mask, node) state.' },
    { id: 'push', label: 'New state', description: 'Walk an edge to an unseen (mask, node) state.' },
    { id: 'skip', label: 'Seen state', description: 'The resulting state was already reached.' },
    { id: 'found', label: 'All visited', description: 'A popped state has the full mask.' },
    { id: 'done', label: 'Complete', description: 'Return the first (shortest) distance with the full mask.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Graph adjacency list (JSON)',
  url: 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/',
  complexity: 'O(2^n * n * deg) time and O(2^n * n) space. Visualization cap: 7 nodes.',
  examples: [
    { label: 'Example 1', input: '[[1,2,3],[0],[0],[0]]' },
    { label: 'Example 2', input: '[[1],[0,2,4],[1,3,4],[2],[1,2]]' },
    { label: 'Cycle', input: '[[1,4],[0,2],[1,3],[2,4],[3,0]]' },
  ],
}
export default function ShortestPathAllNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const prev = run.frames[run.frames.indexOf(step) - 1], pushed = step.phase === 'push', bitsSet = run.input.map((_, i) => ((step.mask >> i) & 1 ? i : -1)).filter(i => i >= 0)
    return <>
    <GraphTraversalView title="Graph: nodes in the current mask are visited" n={run.input.length} edges={edgesFromAdjacency(run.input)}
      current={step.node >= 0 ? (pushed ? step.from : step.node) : null} neighbour={pushed ? step.node : null} visited={bitsSet}
      frontier={step.queueHead} prevFrontier={prev ? prev.queueHead : []} frontierTitle={`BFS queue of states mask@node:distance (front first, ${step.queueLen} queued)`}
      notes={pushed ? [`Moving along edge ${step.from} -> ${step.node} creates a new state.`] : []}
      legend={{ current: 'node we stand on', neighbour: 'node moved to', visited: 'in the state mask' }} />
    <IndexedSequence label="Nodes (visited in the current mask)" length={run.input.length} active={step.node} valueAt={i => `${i}: [${run.input[i].join(',')}]`} roleAt={i => ((step.mask >> i) & 1 ? 'visited' : '')} />
    <StackLane title="Queue (front first, up to 6 shown)" items={step.queueHead} note={`${step.queueLen} queued, ${step.seenCount} states seen`} />
    <output aria-label="Distance">{step.phase === 'done' ? `Shortest path length: ${run.result}` : `Current distance: ${step.dist}`}</output>
  </>}} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the mask:</strong> which nodes were visited matters as much as where we are, so the state is (mask, node). With one bit per node there are only 2^n * n states, and each is processed once.</p>
    <p><strong>Why BFS:</strong> every move costs one edge, so the first time any state with the full mask is popped, its distance is the minimum. Revisiting a node is allowed since a path may need to backtrack.</p>
  </>} />
}
