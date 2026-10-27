import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { edgesFromAdjacency, degreeTags } from '../../components/shared/graphTraversalModel'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the directed graph.' },
    { id: 'init', label: 'Reverse edges', description: 'Compute out-degrees and the reversed adjacency lists.' },
    { id: 'seed', label: 'Seed terminals', description: 'Queue every node with out-degree 0.' },
    { id: 'pop', label: 'Mark safe', description: 'Pop a node and mark it safe.' },
    { id: 'relax', label: 'Relax parents', description: 'Decrease the out-degree of each node pointing to it.' },
    { id: 'enqueue', label: 'Enqueue', description: 'A parent with out-degree 0 becomes safe next.' },
    { id: 'done', label: 'Complete', description: 'Return the sorted safe nodes.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Adjacency list graph (JSON)',
  url: 'https://leetcode.com/problems/find-eventual-safe-states/',
  complexity: 'O(V + E) time and space with the reversed-graph topological peel.',
  examples: [
    { label: 'Example 1', input: '[[1,2],[2,3],[5],[0],[5],[],[]]' },
    { label: 'Example 2 (all cyclic but 4)', input: '[[1,2,3,4],[1,2],[3,4],[0,4],[]]' },
    { label: 'Self loop', input: '[[0],[0,2],[]]' },
  ],
}
export default function EventualSafeStates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const prev = run.frames[run.frames.indexOf(step) - 1], p = step.parent
    return <>
    <GraphTraversalView title="Graph with unresolved out-degree (Kahn on reversed edges)" n={run.input.length} directed edges={edgesFromAdjacency(run.input, true)}
      current={p >= 0 ? p : step.current >= 0 ? step.current : null} neighbour={p >= 0 ? step.current : null}
      visited={step.safe.map((s, i) => (s ? i : -1)).filter(i => i >= 0)} done={step.safe.map((s, i) => (s ? i : -1)).filter(i => i >= 0)}
      frontier={step.queue} prevFrontier={prev ? prev.queue : []} tags={degreeTags(step.outdeg, 'out')}
      notes={p >= 0 ? [`Edge ${p} -> ${step.current} points at a safe node, so node ${p} now waits on ${step.outdeg[p]} unresolved out-edge(s).`] : []}
      legend={{ current: 'node whose out-degree drops (or node just popped)', neighbour: 'safe node it points to', done: 'safe' }} />
    <IndexedSequence label="Out-edges per node (graph[i])" length={run.input.length} active={step.current} valueAt={i => `[${run.input[i].join(',')}]`} roleAt={i => step.safe[i] ? 'safe' : i === step.parent ? 'parent' : ''} />
    <IndexedSequence label="Unresolved out-degree" length={run.input.length} active={step.parent} valueAt={i => step.outdeg[i]} roleAt={i => step.safe[i] ? 'safe' : ''} />
    <StackLane title="Queue (front first)" items={step.queue} />
    <output aria-label="Safe nodes">Safe so far: [{step.safe.map((s, i) => s ? i : -1).filter(i => i >= 0).join(', ')}]</output>
  </>}} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why reversal works:</strong> a node on a cycle can never reach out-degree 0, because the cycle members keep waiting on each other. Everything that can reach a cycle is stuck too.</p>
    {step.phase === 'done' && <p>Result: [{run.result.join(', ')}] out of {run.input.length} nodes.</p>}
  </>} />
}
