import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'List the distinct edge weights as candidate answers.' },
    { id: 'search', label: 'Search', description: 'Binary search over the candidate weights.' },
    { id: 'check', label: 'Reverse BFS', description: 'Check whether every node reaches node 0 with edges up to the limit.' },
    { id: 'record', label: 'Narrow', description: 'Move the search range based on the check.' },
    { id: 'done', label: 'Result', description: 'Report the smallest working limit, or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Graph JSON with n, edges [[from, to, weight]] and threshold',
  url: 'https://leetcode.com/problems/minimize-the-maximum-edge-weight-of-graph/',
  complexity: 'O(E log W + (n + E) log W) time for n nodes, E edges and W distinct weights. The visualization caps n at 8 and weights at 20.',
  examples: [
    { label: 'Chain to zero', input: '{"n":4,"edges":[[3,2,4],[2,1,2],[1,0,3],[0,3,1]],"threshold":2}' },
    { label: 'Fan into zero', input: '{"n":5,"edges":[[1,0,5],[2,0,2],[3,0,7],[4,0,1],[2,1,3]],"threshold":1}' },
    { label: 'Detour', input: '{"n":4,"edges":[[1,2,1],[2,3,6],[3,0,2],[1,0,9]],"threshold":1}' },
  ],
}

export default function MinimizeMaximumEdgeWeight() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <GraphTraversalView title="Reverse search toward node 0" n={run.input.n} edges={step.usable} directed
      current={step.current} neighbour={step.neighbour} visited={step.seen} frontier={step.queue} frontierKind="queue" />
    {step.weights && <AnswerRangeBar title="Candidate limits (distinct edge weights)" min={step.weights[0]} max={step.weights[step.weights.length - 1]}
      low={step.weights[step.lo] ?? step.weights[0]} high={step.weights[Math.min(step.hi, step.weights.length - 1)] ?? step.weights[0]}
      probe={step.mid !== null && step.mid !== undefined ? step.weights[step.mid] : null} verdict={step.probeOk} />}
    <p>{step.limit === null ? 'Choosing a limit' : `Current limit: ${step.limit}`}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Binary search works because a larger limit keeps every edge a smaller limit kept, so reachability to node 0 can only improve.</p>
  </>} />
}
