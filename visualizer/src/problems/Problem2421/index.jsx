import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2421',
  phases: [
    { id: 'setup', label: 'Start', description: 'Each node alone is a good path.' },
    { id: 'join', label: 'Join', description: 'Join two groups at the edge level; equal top values pair up across the join.' },
    { id: 'done', label: 'Result', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"vals": [2, 2, 1], "edges": [[0,1],[1,2]]}',
  url: 'https://leetcode.com/problems/number-of-good-paths/',
  complexity: 'O(n log n) time for the sort and union-find with small-to-large maps. The visualization caps the tree at 10 nodes.',
  examples: [
    { label: 'Example', input: '{"vals":[2,2,1],"edges":[[0,1],[1,2]]}' },
    { label: 'Chain', input: '{"vals":[3,1,3,2],"edges":[[0,1],[1,2],[2,3]]}' },
  ],
}

export default function GoodPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Node values">
      <thead><tr>{run.input.vals.map((_, i) => <th key={i} scope="col">{`node ${i}`}</th>)}</tr></thead>
      <tbody><tr>{run.input.vals.map((v, i) => <td key={i} style={{ textAlign: 'center', color: 'var(--text)' }}>{v}</td>)}</tr></tbody>
    </table>
    <ul aria-label="Groups joined so far">
      {step.groups.map((g, i) => (g.length > 1 || g[0][1] > 0) && <li key={i}>{`node ${i}: ${g.map(([v, c]) => `${c} x value ${v}`).join(', ')}`}</li>)}
    </ul>
    <output aria-label="Good paths">{`good paths ${step.count}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A good path's ends share a value, and nothing on the path is larger than that value. Join nodes in order of their larger endpoint, so every path between two nodes is available once all values along it are at or below the level being joined.</p>
    <p>When two groups join at level v, each node of value v in one group pairs with each node of value v in the other, and each pair is a good path.</p>
  </>} />
}
