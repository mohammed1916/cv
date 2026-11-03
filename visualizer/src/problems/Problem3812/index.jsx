import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3812,
  phases: [
    { id: 'order', label: 'Root', description: 'Root the tree and order nodes from the leaves upward.' },
    { id: 'leaf', label: 'Leaves up', description: 'A node that still differs forces its parent edge to be used.' },
    { id: 'root', label: 'Root check', description: 'The root must match once every other node has been settled.' },
    { id: 'done', label: 'Result', description: 'Report the chosen edges in increasing order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges, start and target (binary strings)',
  url: 'https://leetcode.com/problems/minimum-edge-toggles-on-a-tree/',
  complexity: 'O(n) time: one traversal and one pass over the nodes.',
  examples: [
    { label: 'Path', input: '{"n":4,"edges":[[0,1],[1,2],[2,3]],"start":"0000","target":"0110"}' },
    { label: 'Odd mismatch', input: '{"n":3,"edges":[[0,1],[1,2]],"start":"000","target":"100"}' },
  ],
}

export default function MinimumEdgeToggles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Nodes">
      <thead><tr><th>node</th><th>start</th><th>target</th><th>still differs</th></tr></thead>
      <tbody>{run.input.start.split('').map((s, i) => <tr key={i} data-current={step.at === i ? 'yes' : undefined}>
        <td>{i}</td><td>{s}</td><td>{run.input.target[i]}</td><td>{step.need[i] ? 'yes' : 'no'}</td></tr>)}</tbody>
    </table>
    <ul aria-label="Edges">{run.input.edges.map(([a, b], i) => <li key={i} data-chosen={step.chosen.includes(i) ? 'yes' : undefined}>
      edge {i}: {a} – {b}{step.chosen.includes(i) ? ' (toggled)' : ''}</li>)}</ul>
  </>} renderReasoning={() => <>
    <p>Toggling an edge flips both endpoints, so each edge is useful at most once and the chosen set is fixed by the tree shape.</p>
    <p>Settling nodes from the leaves upward decides each parent edge exactly: a leaf that differs must use its parent edge, and nothing else can fix it.</p>
  </>} />
}
