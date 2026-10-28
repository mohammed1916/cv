import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pieces', description: 'Handle each connected piece on its own.' },
    { id: 'bfs', label: 'Levels', description: 'Measure the levels from a start node in the piece.' },
    { id: 'piece', label: 'Piece total', description: 'Add the best level count for the piece.' },
    { id: 'conflict', label: 'Odd cycle', description: 'An edge inside one level makes grouping impossible.' },
    { id: 'done', label: 'Total', description: 'Return the total number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges, nodes labelled 1 to n (JSON)',
  url: 'https://leetcode.com/problems/divide-nodes-into-the-maximum-number-of-groups/',
  complexity: 'O(n * (n + E)) time with O(n + E) space. The visualization caps nodes at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":6,"edges":[[1,2],[1,4],[1,5],[2,6],[2,3],[4,6]]}' },
    { label: 'Triangle', input: '{"n":3,"edges":[[1,2],[2,3],[3,1]]}' },
  ],
}

export default function MaxGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = Object.fromEntries(Object.entries(step.dist).map(([id, d]) => [id, `level ${d}`]))
    const visited = Object.keys(step.dist).map(Number)
    return <>
      <GraphTraversalView title="Graph (labels 1 to n)" n={run.input.n} edges={run.shifted || run.input.edges.map(([a, b]) => [a - 1, b - 1])}
        labels={Array.from({ length: run.input.n }, (_, i) => String(i + 1))}
        current={step.start} visited={visited} tags={tags} showFrontier={false} />
      <output aria-label="Group state">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Neighbouring nodes must be in adjacent groups, so each connected piece has to be layered like a bipartite graph.</p>
    <p>Starting from every node and counting levels finds the layering with the most groups; a same-level edge means an odd cycle and the answer is -1.</p>
  </>} />
}
