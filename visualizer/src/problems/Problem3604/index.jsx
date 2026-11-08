import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at node 0 at time 0.' },
    { id: 'settle', label: 'Reach node', description: 'Take the earliest reached node and look at its outgoing edges.' },
    { id: 'relax', label: 'Use edge', description: 'Wait for the edge to open, then arrive one second later.' },
    { id: 'done', label: 'Complete', description: 'Report the earliest arrival at the last node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Directed time-window graph {"n", "edges": [[u, v, start, end], ...]} (JSON)',
  url: 'https://leetcode.com/problems/minimum-time-to-reach-destination-in-directed-graph/',
  complexity: 'O((V + E) log V) time. The visualization caps input at 6 nodes and 8 edges.',
  examples: [
    { label: 'Wait', input: '{"n":3,"edges":[[0,1,0,1],[1,2,2,3]]}' },
    { label: 'Closed', input: '{"n":3,"edges":[[0,1,1,1],[1,2,0,0]]}' },
    { label: 'Two nodes, no wait', input: '{"n":2,"edges":[[0,1,0,0]]}' },
    { label: 'Equal open windows', input: '{"n":3,"edges":[[0,1,2,2],[1,2,2,2]]}' },
    { label: 'Widest window', input: '{"n":2,"edges":[[0,1,0,10],[1,0,10,10]]}' },
    { label: 'Long run: 6 nodes, 8 edges', input: '{"n":6,"edges":[[2,0,10,10],[4,0,6,8],[2,3,0,0],[4,5,10,10],[5,0,1,9],[2,3,2,8],[1,0,8,8],[0,4,5,5]]}' },
  ],
}

export default function TimeWindowPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Earliest arrival per node" length={run.input.n} active={step.node}
      valueAt={i => (step.best[i] === Infinity ? '∞' : step.best[i])} roleAt={i => (step.done[i] ? 'final' : '')} />
    <IndexedSequence label="Edges (u to v, open from start to end)" length={run.input.edges.length} active={step.edge}
      valueAt={i => `${run.input.edges[i][0]} to ${run.input.edges[i][1]}: ${run.input.edges[i][2]}-${run.input.edges[i][3]}`} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Arriving earlier never hurts, because you may wait at any node. So the first time a node is settled is its true earliest arrival, and a Dijkstra search over arrival times is exact.</p>
  </>} />
}
