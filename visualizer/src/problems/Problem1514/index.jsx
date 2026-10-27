import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the start node with probability 1.' },
    { id: 'settle', label: 'Settle node', description: 'Expand the most likely node and multiply along its edges.' },
    { id: 'done', label: 'Complete', description: 'Report the best probability found for the end node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Graph {"n", "edges": [[a, b, p], ...], "start", "end"} (JSON)',
  url: 'https://leetcode.com/problems/path-with-maximum-probability/',
  complexity: 'O((V + E) log V) time. The visualization caps input at 6 nodes and 8 edges.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1,0.5],[1,2,0.5],[0,2,0.2]],"start":0,"end":2}' },
    { label: 'Chain', input: '{"n":4,"edges":[[0,1,0.9],[1,3,0.9],[0,3,0.5]],"start":0,"end":3}' },
  ],
}

export default function MaximumProbabilityPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WeightedGraphView {...wgraphState({
      labels: Array.from({ length: run.input.n }, (_, i) => String(i)),
      edges: run.input.edges, dist: step.best, settled: step.settled, active: step.node,
      title: 'Undirected graph (best probability so far; edge labels are probabilities)',
    }).wgraph} />
    <IndexedSequence label="Best probability per node" length={run.input.n} active={step.node} valueAt={i => Number(step.best[i].toFixed(4))} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Probabilities of independent edges multiply, and multiplying never increases a value. That is what lets a best-first search settle each node once, as in Dijkstra with products in place of sums.</p>
  </>} />
}
