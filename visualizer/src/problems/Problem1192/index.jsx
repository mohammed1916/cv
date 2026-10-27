import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the search at node 0.' },
    { id: 'enter', label: 'Visit', description: 'Give the node its discovery time and low value.' },
    { id: 'parent', label: 'Parent edge', description: 'Skip the edge the search arrived by.' },
    { id: 'descend', label: 'Tree edge', description: 'Descend into an unseen neighbour.' },
    { id: 'return', label: 'Return', description: 'Fold the child low value into this node.' },
    { id: 'bridge', label: 'Bridge', description: 'The child cannot reach this node or above without this edge.' },
    { id: 'back', label: 'Back edge', description: 'A visited neighbour lowers this node low value.' },
    { id: 'finish', label: 'Finish', description: 'Every neighbour of this node has been handled.' },
    { id: 'done', label: 'Complete', description: 'Report the bridges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Network: {"n": nodes 0..n-1, "connections": [[u, v], ...]}',
  url: 'https://leetcode.com/problems/critical-connections-in-a-network/',
  complexity: 'O(V + E) time and O(V + E) space. The visualization caps the network at 12 nodes.',
  examples: [
    { label: 'Cycle with a tail', input: '{"n":4,"connections":[[0,1],[1,2],[2,0],[1,3]]}' },
    { label: 'Two cycles joined by a bridge', input: '{"n":6,"connections":[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]]}' },
    { label: 'Path (every edge is a bridge)', input: '{"n":4,"connections":[[0,1],[1,2],[2,3]]}' },
  ],
}

export default function CriticalConnections() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    const tags = Object.fromEntries(step.disc.map((d, i) => [i, d === -1 ? 'unseen' : `disc ${d}, low ${step.low[i]}`]))
    const visited = step.disc.map((d, i) => (d === -1 ? -1 : i)).filter(i => i >= 0)
    return <>
      <GraphTraversalView title="Network (undirected)" n={n} edges={run.input.connections}
        current={step.u >= 0 ? step.u : null} neighbour={step.v >= 0 ? step.v : null}
        visited={visited} frontier={step.stack} frontierKind="stack" frontierTitle="DFS call stack"
        done={step.finished} tags={tags}
        legend={{ current: 'node being visited', neighbour: 'edge being examined', frontier: 'on the call stack', visited: 'discovered', done: 'finished' }} />
      <IndexedSequence label="disc (visit time)" length={n} active={step.u} valueAt={i => (step.disc[i] === -1 ? '-' : step.disc[i])} />
      <IndexedSequence label="low (earliest reachable time)" length={n} active={step.u} valueAt={i => (step.disc[i] === -1 ? '-' : step.low[i])} />
      <output aria-label="Bridges">{`Bridges found: ${step.bridges.map(([a, b]) => `${a}-${b}`).join(', ') || 'none yet'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>An edge u-v (v a child of u in the DFS tree) is a bridge exactly when low[v] &gt; disc[u]: no back edge from v's subtree climbs to u or above.</p>
    <p>Skipping the parent edge once is enough here because the network has no repeated edges.</p>
  </>} />
}
