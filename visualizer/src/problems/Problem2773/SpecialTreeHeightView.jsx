import './SpecialTreeHeightView.css'

const GAP_X = 58
const GAP_Y = 66
const PAD = 40
const R = 18

// Leaves get evenly spaced columns from left to right; each parent sits over the middle of its children.
function layout(tree) {
  const pos = {}
  let column = 0
  const place = (id, depth) => {
    const n = tree.nodes[id]
    const kids = [n.left, n.right].filter(k => k !== null)
    if (kids.length === 0) {
      pos[id] = { x: PAD + column * GAP_X, y: PAD + (depth - 1) * GAP_Y }
      column += 1
      return pos[id].x
    }
    const xs = kids.map(k => place(k, depth + 1))
    pos[id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: PAD + (depth - 1) * GAP_Y }
    return pos[id].x
  }
  if (tree.root !== null) place(tree.root, 1)
  return pos
}

export default function SpecialTreeHeightView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="st-view" aria-label="Special tree height">
        <p className="st-empty">Press Play to walk the tree; the chained leaves are drawn below but never followed.</p>
      </section>
    )
  }

  const { tree } = run
  const pos = layout(tree)
  const leaves = step.leaves || []
  const visited = new Set(step.visited || [])
  const pending = new Set(step.pending || [])
  const current = step.current ?? -1
  const width = Math.max(260, PAD * 2 + Math.max(leaves.length - 1, 0) * GAP_X + 40)
  const maxY = Math.max(0, ...Object.values(pos).map(p => p.y))
  const chainY = maxY + 58
  const height = chainY + 36

  const edges = []
  tree.nodes.forEach(n => {
    for (const child of [n.left, n.right]) {
      if (child === null) continue
      edges.push({ key: `${n.id}-${child}`, a: pos[n.id], b: pos[child], dim: !visited.has(n.id) && !pending.has(n.id) })
    }
  })

  const chains = []
  for (let k = 0; k + 1 < leaves.length; k += 1) {
    const a = pos[leaves[k]]
    const b = pos[leaves[k + 1]]
    chains.push({ key: `${leaves[k]}-${leaves[k + 1]}`, d: `M ${a.x} ${a.y + R} Q ${(a.x + b.x) / 2} ${chainY + 30} ${b.x} ${b.y + R}` })
  }

  return (
    <section className="st-view" aria-label="Special tree height">
      <h3 className="st-title">Deepest path, counting nodes</h3>
      <svg className="st-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tree with ${tree.nodes.length} nodes; best height so far ${step.best}`}>
        {chains.map(c => <path key={c.key} d={c.d} className="st-chain" />)}
        {chains.length > 0 && <text x={PAD} y={chainY + 46} className="st-chain-label">dashed leaf links (not followed)</text>}
        {edges.map(e => <line key={e.key} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} className={`st-edge${e.dim ? ' st-edge--dim' : ''}`} />)}
        {tree.nodes.map(n => {
          const p = pos[n.id]
          const cls = n.id === current ? 'st-node--current' : pending.has(n.id) ? 'st-node--pending' : visited.has(n.id) ? 'st-node--visited' : 'st-node--idle'
          const isLeaf = n.left === null && n.right === null
          return (
            <g key={n.id} className={`st-node ${cls}${isLeaf ? ' st-node--leaf' : ''}`}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text x={p.x} y={p.y + 5} textAnchor="middle">{n.v}</text>
              {pending.has(n.id) && <text x={p.x + R + 4} y={p.y - R + 2} className="st-tag">waiting</text>}
            </g>
          )
        })}
      </svg>
      <div className="st-readout">
        <p><strong>Best so far:</strong> {step.best} node{step.best === 1 ? '' : 's'}</p>
        <p><strong>Current depth:</strong> {current >= 0 ? step.depth : 'none'}</p>
        <p><strong>Waiting:</strong> {(step.pending || []).map(id => tree.nodes[id].v).join(', ') || 'nothing'}</p>
      </div>
      <output className="st-message" aria-label="Step message">{step.message}</output>
    </section>
  )
}
