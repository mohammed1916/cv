import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Every node starts as its own component.' },
    { id: 'merge', label: 'Merge', description: 'An edge joins two components; they share the AND of both costs and the edge weight.' },
    { id: 'same', label: 'Same side', description: 'An edge inside one component only lowers its cost.' },
    { id: 'query', label: 'Query', description: 'Same component: answer with its cost. Different components: -1.' },
    { id: 'done', label: 'Result', description: 'Every query has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges [[u, v, w]] (weights 0 to 31) and queries [[s, t]]',
  url: 'https://leetcode.com/problems/minimum-cost-walk-in-weighted-graph/',
  complexity: 'O((n + m) * alpha(n)) with union-find, where alpha is the inverse Ackermann function. The visualization caps n at 8 and edges at 12.',
  examples: [
    { label: 'One component', input: '{"n":5,"edges":[[0,1,14],[1,2,7],[2,3,6],[1,3,13]],"queries":[[0,3],[0,2]]}' },
    { label: 'Two components', input: '{"n":5,"edges":[[0,1,9],[1,2,11],[3,4,12]],"queries":[[0,2],[2,3]]}' },
    { label: 'Small chain', input: '{"n":3,"edges":[[0,1,3],[1,2,2]],"queries":[[0,2]]}' },
    { label: "Two nodes, zero weight", input: "{\"n\":2,\"edges\":[[0,1,0]],\"queries\":[[0,1]]}" },
    { label: "Unreachable pair", input: "{\"n\":3,\"edges\":[[0,1,5]],\"queries\":[[0,2]]}" },
    { label: "Equal weights", input: "{\"n\":4,\"edges\":[[0,1,7],[1,2,7],[2,3,7],[0,3,7]],\"queries\":[[0,2]]}" },
    { label: "Largest weights, 8 nodes", input: "{\"n\":8,\"edges\":[[0,1,31],[1,2,31],[2,3,31],[3,4,31],[4,5,31],[5,6,31],[6,7,31],[0,7,31],[0,4,31],[2,6,31],[1,5,31],[3,7,31]],\"queries\":[[0,7],[1,6]]}" },
    { label: "Long run: 8 nodes and 12 edges", input: "{\"n\":8,\"edges\":[[3,6,29],[0,7,10],[1,4,27],[6,5,0],[7,2,9],[4,3,6],[5,0,7],[2,1,28],[3,6,21],[0,7,2],[1,4,19],[6,5,24]],\"queries\":[[7,2],[1,4],[3,6],[5,0],[7,2],[1,4]]}" },
  ],
}

// Read a root by following parents without changing the stored tree.
function rootOf(parent, x) {
  let at = x
  while (parent[at] !== at) at = parent[at]
  return at
}

export default function MinimumCostWalk() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const labels = Array.from({ length: run.input.n }, (_, i) => String(i))
    const edgeStates = {}
    if (step.edge >= 0) edgeStates[step.edge] = step.phase === 'merge' ? 'chosen' : 'current'
    const rows = labels.map((label, i) => {
      const root = rootOf(step.parent, i)
      return { node: label, parent: step.parent[i], root, 'cost of component': step.cost[root] }
    })
    return <>
      <WeightedGraphView labels={labels} edges={run.input.edges} edgeStates={edgeStates} title="Graph and merged components" />
      <RecordStateTable label="Component of each node" columns={['node', 'parent', 'root', 'cost of component']} rows={rows} />
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A walk may repeat edges, so from any node you can detour through every edge of your component and come back. The cheapest walk therefore uses the AND of all edge weights in the component.</p>
    <p>Adding edges can only clear more bits, so the AND never rises. Nodes in different components have no walk at all, so their answer is -1.</p>
  </>} />
}
