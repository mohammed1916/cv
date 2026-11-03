import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '1584',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with points (JSON list of [x, y])',
  url: 'https://leetcode.com/problems/min-cost-to-connect-all-points/',
  complexity: 'O(n^2) time and O(n) space with Prim\'s algorithm and Manhattan distances. The visualization caps n at 15.',
  examples: [
    { label: 'Triangle', input: '{"points":[[0,0],[2,2],[3,10],[5,2],[7,0]]}' },
    { label: 'Line', input: '{"points":[[1,1],[4,1],[7,1]]}' },
    { label: 'Single point', input: '{"points":[[3,-2]]}' },
  ],
}

export default function ConnectPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points } = run.input
    const { dist, inTree, edges, u, total } = step.snapshot
    return <>
      <table aria-label="Points and distances to the tree" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>point</th><th>x, y</th><th>distance</th><th>in tree</th></tr></thead>
        <tbody>{points.map((p, k) => <tr key={k} data-index={k} style={{ background: k === u ? 'var(--surface2)' : 'transparent' }}>
          <td>{k}</td><td>{p[0]}, {p[1]}</td><td>{dist[k] === null ? '∞' : dist[k]}</td><td>{inTree[k] ? 'yes' : 'no'}</td>
        </tr>)}</tbody>
      </table>
      <p>Edges chosen: {edges.length ? edges.map(([a, b]) => `${a}-${b}`).join(', ') : 'none yet'}</p>
      <p>Tree weight so far: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Greedy growth:</strong> the cheapest edge leaving a tree is always safe to add, so the tree grows one nearest point at a time.</p>
    <p><strong>Distances:</strong> each point remembers the shortest link to the tree; attaching a point can only shorten those links.</p>
  </>} />
}
