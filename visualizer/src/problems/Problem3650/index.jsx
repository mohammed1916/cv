import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at node 0 with cost 0.' },
    { id: 'settle', label: 'Settle node', description: 'Take the cheapest node and relax its forward and reversed arcs.' },
    { id: 'done', label: 'Complete', description: 'Report the cost to node n-1 or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Directed graph {"n", "edges": [[u, v, w], ...]} (JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-path-with-edge-reversals/',
  complexity: 'O((V + E) log V) time over 2E arcs. The visualization caps input at 6 nodes and 8 edges.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,1,3],[3,1,1],[2,3,4],[0,2,1]]}' },
    { label: 'Reversal', input: '{"n":2,"edges":[[1,0,2]]}' },
  ],
}

export default function EdgeReversals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WeightedGraphView {...wgraphState({
      labels: Array.from({ length: run.input.n }, (_, i) => String(i)),
      edges: run.input.edges, directed: true, dist: step.dist, settled: step.done, active: step.node,
      title: 'Directed graph (costs so far; the table lists every node)',
    }).wgraph} />
    <IndexedSequence label="Edges as given (u to v, weight)" length={run.input.edges.length} valueAt={i => `${run.input.edges[i][0]} to ${run.input.edges[i][1]} (${run.input.edges[i][2]})`} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Reversing an edge u to v means travelling v to u at twice its weight. Adding that arc up front turns the problem into an ordinary shortest path.</p>
  </>} />
}
