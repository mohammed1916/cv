import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the heap with node 0.' },
    { id: 'pop', label: 'Pop node', description: 'Pop the closest node; skip stale entries.' },
    { id: 'relax', label: 'Relax edge', description: 'Record subdivision nodes used and update distances.' },
    { id: 'count', label: 'Count edge', description: 'Add subdivision nodes reachable from either end.' },
    { id: 'done', label: 'Complete', description: 'Return the total reachable count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Input {edges, maxMoves, n} (JSON)',
  url: 'https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/',
  complexity: 'O((V + E) log V) time with a heap; subdivision nodes are never materialised.',
  examples: [
    { label: 'Official 1', input: '{"edges":[[0,1,10],[0,2,1],[1,2,2]],"maxMoves":6,"n":3}' },
    { label: 'Official 2', input: '{"edges":[[0,1,4],[1,2,6],[0,2,8],[1,3,1]],"maxMoves":10,"n":4}' },
    { label: 'Disconnected', input: '{"edges":[[1,2,4],[1,4,5],[1,3,1],[2,3,4],[3,4,5]],"maxMoves":17,"n":5}' },
  ],
}

export default function ReachableNodesInSubdividedGraph() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { n, edges } = run.input
      const nodes = Array.from({ length: n }, (_, i) => String(i))
      return <>
        {n <= 14 && <WeightedGraphView {...wgraphState({
          labels: nodes, edges: edges.map(([u, v, c]) => [u, v, c + 1]), title: 'Original graph (edge weight = new nodes + 1 = moves to cross)',
          dist: step.dist.map(x => (x === null ? Infinity : x)), settled: nodes.map((_, i) => step.settled.includes(i)), active: step.node ?? -1,
          pq: [...step.heap].sort((x, y) => x[0] - y[0] || x[1] - y[1]).map(([d, u]) => `${d} @${u}`), pqLabel: 'Heap (moves @ node, smallest first)',
          edgeStates: step.edge ? { [edges.findIndex(([a, b]) => (a === step.edge[0] && b === step.edge[1]) || (a === step.edge[1] && b === step.edge[0]))]: 'active' } : {},
          ops: step.ops ?? [],
        }).wgraph} />}
        <IndexedSequence label="dist from node 0 (blank = not reached within budget)" length={n} valueAt={i => (step.dist[i] === null ? '–' : step.dist[i])} active={step.node ?? -1}
          roleAt={i => (step.settled.includes(i) ? 'settled' : '')} />
        {step.heapState && <HeapView {...step.heapState} />}
        <output aria-label="Reachable">Reachable so far: {step.ans}</output>
        {step.edge && <output aria-label="Current edge">Current edge: {step.edge[0]}-{step.edge[1]}</output>}
      </>
    }}
    renderReasoning={({ run, step }) => <>
      <p>{step.message}</p>
      <p><strong>Idea:</strong> a subdivision node on edge u-v is reachable if we can walk into it from u or from v. From u we can enter min(cnt, maxMoves - dist[u]) of them; the two directions may overlap, so cap the sum at cnt. maxMoves = {run.input.maxMoves}.</p>
    </>} />
}
