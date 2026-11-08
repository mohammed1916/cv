import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
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
    { label: 'Five-node tree, three queries', input: '{"n":5,"edges":[[0,2,4],[2,1,6],[1,3,2],[1,4,9]],"queries":[[0,4],[3,4],[2,2]]}' },
    { label: "Two nodes", input: "{\"n\":2,\"edges\":[[0,1,5]],\"queries\":[[0,1]]}" },
    { label: "Star with equal weights", input: "{\"n\":4,\"edges\":[[0,1,3],[0,2,3],[0,3,3]],\"queries\":[[1,2],[2,3]]}" },
    { label: "Chain with heaviest weight", input: "{\"n\":10,\"edges\":[[0,1,26],[1,2,26],[2,3,26],[3,4,26],[4,5,26],[5,6,26],[6,7,26],[7,8,26],[8,9,26]],\"queries\":[[0,9],[4,5]]}" },
    { label: "Long run: 10 seeded nodes", input: "{\"n\":10,\"edges\":[[0,1,3],[0,2,16],[2,3,5],[2,4,14],[0,5,3],[4,6,10],[6,7,15],[6,8,18],[2,9,17]],\"queries\":[[1,8],[1,2],[1,0],[3,8],[1,8],[3,6]]}" },
  ],
}

const cell = { padding: '4px 8px', borderBottom: '1px solid var(--surface2)', color: 'var(--text)', textAlign: 'left' }

export default function EquilibriumQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <GraphTraversalView title="Tree (each node shows its edge weight to the parent)" n={step.tags ? Object.keys(step.tags).length : 0}
      edges={step.edges} directed={false} labels={null} tags={step.tags} visited={step.pathNodes} done={[]} showFrontier={false} />
    <ol aria-label="Path weights" className="algorithm-chain">
      {step.weights.map((w, i) => <li key={i}>{w}</li>)}
    </ol>
    {step.counts.length > 0 && <table aria-label="Weight counts on the path" style={{ borderCollapse: 'collapse' }}>
      <thead><tr>{['weight', 'edges on path', 'kept'].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
      <tbody>{step.counts.map(([w, c], i) => <tr key={w}>
        <td style={cell}>{w}</td><td style={cell}>{c}</td><td style={cell}>{i === 0 ? 'most common: kept' : 'changed'}</td>
      </tr>)}</tbody>
    </table>}
    <output aria-label="Cost">{step.cost === null ? 'Waiting for a query' : `Cost for this query: ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation changes one edge to any weight, so the cheapest target is the most common weight on the path.</p>
    <p>Every other edge on that path needs exactly one change.</p>
  </>} />
}
