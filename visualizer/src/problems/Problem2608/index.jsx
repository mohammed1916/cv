import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No cycle has been found yet.' },
    { id: 'source', label: 'New source', description: 'Start a breadth-first search from the next node.' },
    { id: 'edge', label: 'Closing edge', description: 'An edge reaches an already-seen node that is not the parent: a walk closes.' },
    { id: 'better', label: 'Shorter cycle', description: 'This closing edge gives the shortest cycle found so far.' },
    { id: 'done-source', label: 'Search finished', description: 'Every node reached from this source has its distance recorded.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest cycle length, or -1 for a forest.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n (nodes) and edges (undirected pairs, no repeats)',
  url: 'https://leetcode.com/problems/shortest-cycle-in-a-graph/',
  complexity: 'O(n * (n + e)) time for a search from every node. The visualization caps the graph at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"edges":[[0,1],[1,2],[2,0],[3,4],[4,5],[5,6],[6,3]]}' },
    { label: 'Example 2', input: '{"n":4,"edges":[[0,1],[0,2]]}' },
  ],
}

export default function ShortestCycleInGraph() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, edges } = run.input
    return <>
      <GraphTraversalView title="Undirected graph" n={n} edges={edges} current={step.current} visited={step.reached} tags={step.tags} showFrontier={false} />
      <output aria-label="Best cycle">{`Source: ${step.source ?? '-'}. Shortest cycle so far: ${step.best ?? 'none yet'}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A shortest cycle can be found from any of its own nodes, and from there a breadth-first search meets it through a non-tree edge.</p>
    <p>Trying every start node keeps the best closing edge found, so the minimum over all searches is the shortest cycle.</p>
  </>} />
}
