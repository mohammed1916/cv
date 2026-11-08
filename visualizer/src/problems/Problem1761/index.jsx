import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Degrees', description: 'Count the edges at each node.' },
    { id: 'check', label: 'Check triple', description: 'Test whether three nodes are pairwise joined.' },
    { id: 'trio', label: 'Connected trio', description: 'Score the trio by the edges that leave it.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum degree, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (3 to 10) and edges (1-based pairs), e.g. {"n":3,"edges":[[1,2],[2,3],[1,3]]}',
  url: 'https://leetcode.com/problems/minimum-degree-of-a-connected-trio-in-a-graph/',
  complexity: 'O(n^3 + m) time and O(n^2) space for the adjacency table. The visualization caps n at 10.',
  examples: [
    { label: 'Five nodes, one path', input: '{"n":5,"edges":[[1,5],[2,4],[4,5],[3,1]]}' },
    { label: 'Two cycles and a pendant', input: '{"n":9,"edges":[[1,2],[2,3],[3,4],[4,1],[5,6],[6,7],[7,8],[8,5],[9,1]]}' },
  { label: 'Smallest graph, no edges', input: "{\"n\":3,\"edges\":[]}" },
  { label: 'Complete graph on four nodes', input: "{\"n\":4,\"edges\":[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]}" },
  { label: 'Largest graph, first 25 pairs', input: "{\"n\":10,\"edges\":[[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[2,10],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9],[3,10],[4,5]]}" },
  { label: 'Long run: 10 nodes, 18 edges', input: "{\"n\":10,\"edges\":[[3,9],[5,9],[9,7],[5,2],[10,6],[7,10],[6,1],[2,7],[3,10],[8,9],[3,7],[8,1],[9,1],[10,1],[9,2],[2,1],[8,3],[5,10]]}" },
  ],
}

export default function MinimumDegreeTrio() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    ;(step.trio || []).forEach(v => { tags[v - 1] = 'trio' })
    if (step.bestTrio) step.bestTrio.forEach(v => { if (!tags[v - 1]) tags[v - 1] = 'best' })
    const labels = Array.from({ length: run.input.n }, (_, i) => String(i + 1))
    const edges = run.input.edges.map(([a, b]) => [a - 1, b - 1])
    return <>
      <GraphTraversalView title="Graph (1-based labels)" n={run.input.n} labels={labels} edges={edges} tags={tags} />
      <output aria-label="Best trio">{`Best so far: ${step.best ?? 'none'}${step.trio ? `, checking ${step.trio.join(', ')}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each edge that leaves a trio adds one to the trio degree. The three internal edges are counted twice in the degree sum, so six is subtracted.</p>
    <p>Checking every triple of nodes is small enough here because the visualization caps the graph at 10 nodes.</p>
  </>} />
}
