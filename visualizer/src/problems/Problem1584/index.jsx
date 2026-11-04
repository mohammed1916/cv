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

function PointPlot({ points, edges, u, inTree }) {
  const xs = points.map(p => p[0]); const ys = points.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const pad = 24, size = 260
  const span = Math.max(1, maxX - minX, maxY - minY)
  const sx = p => pad + ((p[0] - minX) / span) * (size - 2 * pad)
  const sy = p => size - pad - ((p[1] - minY) / span) * (size - 2 * pad)
  return <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 300 }} role="img" aria-label="Points and tree edges">
    {edges.map(([a, b], k) => <line key={k} x1={sx(points[a])} y1={sy(points[a])} x2={sx(points[b])} y2={sy(points[b])} stroke="var(--success)" strokeWidth={3} />)}
    {points.map((p, k) => <g key={k}>
      <circle cx={sx(p)} cy={sy(p)} r={k === u ? 9 : 6} fill={inTree[k] ? 'var(--success)' : 'var(--surface2)'} stroke="var(--text)" strokeWidth={k === u ? 2.5 : 1} />
      <text x={sx(p) + 10} y={sy(p) - 8} fill="var(--text)" fontSize="12" fontFamily="monospace">{k}</text>
    </g>)}
  </svg>
}

export default function ConnectPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points } = run.input
    const { dist, inTree, edges, u, total } = step.snapshot
    return <>
      <PointPlot points={points} edges={edges} u={u} inTree={inTree} />
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
