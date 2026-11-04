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
    { label: 'Odd mismatch', input: '{"n":3,"edges":[[1,0],[2,1]],"start":"001","target":"110"}' },
  ],
}

const GAP_X = 64, GAP_Y = 70, PAD = 32

// Layered drawing of the tree rooted at node 0: each depth is one row.
function layoutTree(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b], idx) => { adj[a].push([b, idx]); adj[b].push([a, idx]) })
  const depth = Array(n).fill(-1), parent = Array(n).fill(-1), parentEdge = Array(n).fill(-1)
  depth[0] = 0
  const order = [0]
  for (let k = 0; k < order.length; k++) {
    const v = order[k]
    for (const [w, idx] of adj[v]) if (depth[w] < 0) { depth[w] = depth[v] + 1; parent[w] = v; parentEdge[w] = idx; order.push(w) }
  }
  const rows = []
  order.forEach(v => { (rows[depth[v]] ??= []).push(v) })
  const pos = new Map()
  rows.forEach((row, d) => row.forEach((v, i) => pos.set(v, { x: PAD + (i + 0.5 + (rows[d].length === 1 ? 0 : 0)) * GAP_X, y: PAD + d * GAP_Y })))
  const width = PAD * 2 + Math.max(...rows.map(r => r.length)) * GAP_X
  const height = PAD * 2 + (rows.length - 1) * GAP_Y
  return { pos, parent, parentEdge, width, height }
}

function TreeView({ n, edges, need, chosen, active }) {
  const { pos, parent, parentEdge, width, height } = layoutTree(n, edges)
  return <svg className="tree-edges" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img"
    aria-label={`Tree with ${n} nodes rooted at 0`}>
    {Array.from({ length: n }, (_, v) => v).filter(v => parent[v] >= 0).map(v => {
      const a = pos.get(parent[v]), b = pos.get(v)
      const used = chosen.includes(parentEdge[v])
      return <g key={v}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={used ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={used ? 4 : 1.5} />
        <text x={(a.x + b.x) / 2 + 6} y={(a.y + b.y) / 2} fontSize="11" fill="var(--text-muted)">e{parentEdge[v]}</text>
      </g>
    })}
    {Array.from({ length: n }, (_, v) => v).map(v => {
      const p = pos.get(v)
      const isActive = active === v
      return <g key={v}>
        <circle cx={p.x} cy={p.y} r="18" fill={need[v] ? 'var(--surface2)' : 'var(--primary)'} stroke={isActive ? 'var(--text)' : 'var(--text-muted)'} strokeWidth={isActive ? 4 : 1} />
        <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="12" fill={need[v] ? 'var(--text)' : 'var(--surface)'}>{v}</text>
      </g>
    })}
  </svg>
}

export default function MinimumEdgeToggles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p className="tree-legend"><span>Filled node: matches its target</span> · <span>Hollow node: still differs</span> · <span>Thick edge: toggled</span></p>
    <TreeView n={run.input.n} edges={run.input.edges} need={step.need} chosen={step.chosen} active={step.at} />
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
