import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at node 0 at time 0.' },
    { id: 'settle', label: 'Visit node', description: 'Visit the earliest reachable node and try each neighbour before its deadline.' },
    { id: 'done', label: 'Complete', description: 'Report the earliest visit time of every node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Graph, edges and disappearance times (JSON)',
  url: 'https://leetcode.com/problems/minimum-time-to-visit-disappearing-nodes/',
  complexity: 'O((V + E) log V) time. The visualization caps input at 7 nodes and 12 edges.',
  examples: [
    { label: 'Example', input: '{"n":3,"edges":[[0,1,2],[1,2,2],[0,2,5]],"disappear":[10,3,10]}' },
    { label: 'Deadline', input: '{"n":3,"edges":[[0,1,2],[1,2,2],[0,2,5]],"disappear":[10,2,10]}' },
  ],
}

export default function DisappearingNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WeightedGraphView {...wgraphState({
      labels: Array.from({ length: run.input.n }, (_, i) => String(i)),
      edges: run.input.edges, dist: step.dist, settled: step.settled, active: step.node,
      title: 'Undirected graph (earliest visit times)',
    }).wgraph} />
    <IndexedSequence label="Disappears at time" length={run.input.n} active={step.node} valueAt={i => run.input.disappear[i]} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Earliest arrival is the right thing to keep: arriving sooner never hurts, because a node can only be visited before its deadline.</p>
  </>} />
}
