import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Root the tree at node 0 so paths can be climbed.' },
    { id: 'query', label: 'Query', description: 'Count the weights on one path and keep the most common.' },
    { id: 'done', label: 'Complete', description: 'Report the cost of every query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges [u, v, w] and queries [a, b] (JSON)',
  url: 'https://leetcode.com/problems/minimum-edge-weight-equilibrium-queries-in-a-tree/',
  complexity: 'O(n + q * path length) time in this direct climb. The visualization caps the tree at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"edges":[[0,1,1],[1,2,1],[2,3,1],[3,4,2],[4,5,2],[5,6,2]],"queries":[[0,3],[3,6],[2,6],[0,6]]}' },
  ],
}

export default function EquilibriumQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ol aria-label="Path weights" className="algorithm-chain">
      {step.weights.map((w, i) => <li key={i}>{w}</li>)}
    </ol>
    <output aria-label="Cost">{step.cost === null ? 'Waiting for a query' : `Cost for this query: ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation changes one edge to any weight, so the cheapest target is the most common weight on the path.</p>
    <p>Every other edge on that path needs exactly one change.</p>
  </>} />
}
