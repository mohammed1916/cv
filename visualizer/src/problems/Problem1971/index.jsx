import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1971',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n, edges, source and destination (e.g. {"n":6,"edges":[[0,1],[0,2],[3,5],[5,4],[4,3]],"source":0,"destination":5})',
  url: 'https://leetcode.com/problems/find-if-path-exists-in-graph/',
  complexity: 'O(V + E) time and O(V) space for the queue and visited marks.',
  examples: [
    { label: 'Triangle', input: '{"n":3,"edges":[[0,1],[1,2],[2,0]],"source":0,"destination":2}' },
    { label: 'Two components', input: '{"n":6,"edges":[[0,1],[0,2],[3,5],[5,4],[4,3]],"source":0,"destination":5}' },
  ],
}

export default function Problem1971Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <GraphTraversalView title="Breadth-first search" n={run.input.n} edges={run.input.edges}
        current={step.current} neighbour={step.neighbour} visited={step.visited} frontier={step.frontier} done={step.done}
        frontierKind="queue" />
      {step.result !== undefined && <output aria-label="Path found">Path exists: {step.result ? 'yes' : 'no'}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
