import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin Dijkstra at node n.' },
    { id: 'settle', label: 'Distances', description: 'Settle the nearest unsettled node and relax its edges.' },
    { id: 'count', label: 'Count paths', description: 'Count restricted paths in increasing distance order.' },
    { id: 'done', label: 'Complete', description: 'Report the count from node 1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Graph {"n": nodes, "edges": [[u, v, w], ...]} (JSON)',
  url: 'https://leetcode.com/problems/number-of-restricted-paths-from-first-to-last-node/',
  complexity: 'O((V + E) log V) time for Dijkstra plus O(V log V + E) for the count. The visualization caps input at 8 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"edges":[[1,2,3],[1,3,3],[2,3,1],[1,4,2],[5,2,2],[3,5,1],[5,4,10]]}' },
    { label: 'Path', input: '{"n":3,"edges":[[1,2,1],[2,3,1],[1,3,5]]}' },
  ],
}

export default function RestrictedPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WeightedGraphView {...wgraphState({
      labels: Array.from({ length: run.input.n }, (_, i) => String(i + 1)),
      edges: run.input.edges.map(([u, v, w]) => [u - 1, v - 1, w]),
      dist: step.dist, settled: step.settled, active: step.current - 1,
      title: `Graph with distance to node ${run.input.n}`,
    }).wgraph} />
    <IndexedSequence label="Restricted path counts by node" length={run.input.n} indexOffset={1} active={step.current - 1} valueAt={i => step.ways[i] || '0'} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A restricted path moves only to nodes strictly closer to node n. Counting nodes from closest to farthest means every neighbour that a node may step to already has its count.</p>
  </>} />
}
