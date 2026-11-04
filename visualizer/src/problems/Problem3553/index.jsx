import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

function TreeView({ run, step }) {
  const { n, edges } = run.input
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const build = (id, parent) => ({ id, children: adj[id].filter(next => next !== parent).map(next => build(next, id)) })
  const queried = step.query >= 0 ? run.input.queries[step.query] : []
  const roles = Object.fromEntries(queried.map(id => [id, 'target']))
  return <RootedTreeDiagram root={build(0, -1)} title="Tree with the current query nodes" roles={roles} />
}

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Record each node’s distance from node 0.' },
    { id: 'query', label: 'Query', description: 'Take the next three nodes.' },
    { id: 'pair', label: 'Distances', description: 'Compute the three pairwise distances.' },
    { id: 'sum', label: 'Half sum', description: 'The cheapest subgraph is half the sum.' },
    { id: 'done', label: 'Result', description: 'Report every query answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges [u,v,w] (tree) and queries [a,b,c]',
  url: 'https://leetcode.com/problems/minimum-weighted-subgraph-with-the-required-paths-ii/',
  complexity: 'O(n + q * n) time in this walk-up version, O(n) space. The visualization caps n at 8.',
  examples: [
    { label: 'Path', input: '{"n":3,"edges":[[0,1,2],[1,2,3]],"queries":[[0,2,1]]}' },
    { label: 'Star', input: '{"n":4,"edges":[[0,1,1],[0,2,2],[0,3,4]],"queries":[[1,2,3]]}' },
  ],
}

export default function MinimumWeightedSubgraph() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <TreeView run={run} step={step} />
    <table aria-label="Query distances">
      <tbody>
        <tr><th scope="row">Current query</th><td>{step.query >= 0 ? run.input.queries[step.query].join(', ') : 'none yet'}</td></tr>
        <tr><th scope="row">Distances</th><td>{step.label}</td></tr>
        <tr><th scope="row">Answers so far</th><td>{step.answers.length ? `[${step.answers.join(', ')}]` : '[]'}</td></tr>
      </tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Three nodes in a tree are joined by the union of the paths between them, and each edge in that union is counted twice in the sum of the three pairwise distances.</p>
    <p>So the cheapest subgraph has weight equal to half of d(a,b) + d(b,c) + d(a,c).</p>
  </>} />
}
