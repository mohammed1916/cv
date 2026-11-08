import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2685',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Every vertex starts as its own component.' },
    { id: 'merge', label: 'Merge', description: 'An edge joins two components and adds its edge count.' },
    { id: 'same', label: 'Same component', description: 'An edge inside a component adds one edge to it.' },
    { id: 'check', label: 'Check', description: 'A component is complete when its edges equal every pair of its vertices.' },
    { id: 'done', label: 'Result', description: 'Report the count of complete components.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 6, "edges": [[0,1],[0,2],[1,2],[3,4]]}',
  url: 'https://leetcode.com/problems/count-the-number-of-complete-components/',
  complexity: 'Near-linear time with union-find over n vertices and m edges. The visualization caps n at 8.',
  examples: [
    { label: 'Triangle and pair', input: '{"n":5,"edges":[[0,1],[1,2],[0,2],[3,4]]}' },
    { label: 'Path is not complete', input: '{"n":4,"edges":[[0,1],[1,2],[2,3]]}' },
    { label: 'Single vertex', input: '{"n":1,"edges":[]}' },
    { label: 'Complete graph on four vertices', input: '{"n":4,"edges":[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]}' },
    { label: 'Largest n: 8-cycle', input: '{"n":8,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]]}' },
    { label: 'Long run: 8 vertices, 12 edges', input: '{"n":8,"edges":[[6,1],[6,3],[6,4],[0,2],[5,6],[7,4],[7,5],[7,2],[3,2],[2,4],[1,3],[4,1]]}' },
  ],
}

export default function CountCompleteComponents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <GraphTraversalView title="Vertices and edges" n={run.input.n} edges={run.input.edges}
      current={step.current} neighbour={step.neighbour} tags={step.tags} showFrontier={false} />
    <output aria-label="Complete components">{step.result === null ? `Edges read: ${step.edgeIndex + 1} of ${run.input.edges.length}` : `Complete components: ${step.result}`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Union-find keeps each component's vertex count and edge count. A component with k vertices is complete exactly when it has k(k-1)/2 edges, because no pair can be missing.</p>
  </>} />
}
