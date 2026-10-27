import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan', description: 'Explain the two-sided distance test.' },
    { id: 'distances', label: 'Distances', description: 'Run Dijkstra from node 0 and from node n-1.' },
    { id: 'check', label: 'Check edge', description: 'Test whether the edge lies on a shortest total path.' },
    { id: 'done', label: 'Complete', description: 'Report every edge flag.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Undirected weighted graph {"n", "edges": [[a, b, w], ...]} (JSON)',
  url: 'https://leetcode.com/problems/find-edges-in-shortest-paths/',
  complexity: 'O((V + E) log V) time for two Dijkstra runs. The visualization caps input at 6 nodes and 9 edges.',
  examples: [
    { label: 'Example 1', input: '{"n":6,"edges":[[0,1,4],[0,2,1],[1,3,2],[1,4,3],[1,5,1],[2,3,1],[3,5,3],[4,5,2]]}' },
    { label: 'Example 2', input: '{"n":4,"edges":[[2,0,1],[0,1,1],[1,3,5],[2,3,1]]}' },
  ],
}

export default function EdgesOnShortestPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const states = {}
    step.decisions.forEach((d, i) => { if (d === true) states[i] = 'chosen'; else if (d === false) states[i] = 'rejected' })
    if (step.current >= 0) states[step.current] = 'active'
    return <>
      <WeightedGraphView {...wgraphState({
        labels: Array.from({ length: run.input.n }, (_, i) => String(i)),
        edges: run.input.edges, dist: step.dist, active: -1, edgeStates: states,
        title: 'Graph (green = on a shortest path, red dashed = not)',
      }).wgraph} />
      <IndexedSequence label="Edges (index, a-b, weight)" length={run.input.edges.length} active={step.current}
        valueAt={i => `${run.input.edges[i][0]}-${run.input.edges[i][1]} (${run.input.edges[i][2]})`}
        roleAt={i => (step.decisions[i] === true ? 'on path' : step.decisions[i] === false ? 'off path' : '')} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>An edge a-b can be used in the forward or the backward direction. It is on a shortest path only when going from node 0 to a and from b to node n-1 costs exactly the shortest total minus the edge weight.</p>
  </>} />
}
