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
    { label: 'Example 1', input: '{"n":6,"edges":[[1,2],[1,3],[3,2],[4,1],[5,2],[3,6]]}' },
    { label: 'Example 2', input: '{"n":7,"edges":[[1,3],[4,1],[4,3],[2,5],[5,6],[6,7],[7,5],[2,6]]}' },
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
