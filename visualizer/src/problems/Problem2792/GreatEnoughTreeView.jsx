import './GreatEnoughTreeView.css'

const RADIUS = 20
const GAP_X = 52
const GAP_Y = 74

// Place nodes by in-order position (x) and depth (y) so sibling subtrees never overlap.
function layout(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]))
  const pos = new Map()
  let cursor = 0
  const walk = (id, depth) => {
    if (id < 0 || !byId.has(id)) return
    const node = byId.get(id)
    walk(node.left, depth + 1)
    pos.set(id, { x: cursor * GAP_X + RADIUS + 12, y: depth * GAP_Y + RADIUS + 12, depth })
    cursor++
    walk(node.right, depth + 1)
  }
  if (nodes.length) walk(0, 0)
  const depth = nodes.reduce((m, n) => Math.max(m, pos.get(n.id)?.depth ?? 0), 0)
  return { pos, width: Math.max(1, cursor) * GAP_X + 24, height: (depth + 1) * GAP_Y + 24 }
}

export default function GreatEnoughTreeView({ run, step }) {
  const { pos, width, height } = layout(run.nodes)
  const stateOf = id => {
    if (step.node === id) return 'current'
    if (step.verdicts[id] === 'yes') return 'counted'
    if (step.verdicts[id] === 'no') return 'skipped'
    return 'pending'
  }
  const edges = run.nodes.flatMap(n => [n.left, n.right].filter(c => c >= 0).map(c => ({ from: n.id, to: c })))

  return (
    <div className="great-tree">
      <svg viewBox={`0 0 ${width} ${height}`} className="great-tree-svg" role="img" aria-label="Binary tree with subtree checks">
        {edges.map(e => {
          const a = pos.get(e.from)
          const b = pos.get(e.to)
          return <line key={`${e.from}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="edge" />
        })}
        {run.nodes.map(n => {
          const p = pos.get(n.id)
          const state = stateOf(n.id)
          const mark = state === 'counted' ? '✓' : state === 'skipped' ? '×' : ''
          return (
            <g key={n.id} className={`node ${state}`} transform={`translate(${p.x} ${p.y})`}>
              <circle r={RADIUS} />
              <text className="node-value" textAnchor="middle" dominantBaseline="central">{n.val}</text>
              {mark && <text className="node-mark" textAnchor="middle" y={RADIUS + 12}>{mark}</text>}
            </g>
          )
        })}
      </svg>
      <div className="great-tree-readout" aria-live="polite">
        <span>{step.node >= 0 ? `Node ${run.nodes.find(n => n.id === step.node)?.val}` : 'No node yet'}</span>
        <span>{step.smaller !== null ? `strictly smaller in subtree: ${step.smaller}` : 'smaller count pending'}</span>
        <span>{`need at least k = ${step.k}`}</span>
        <span className="great-tree-count">{`count = ${step.count}`}</span>
      </div>
      {step.values && (
        <p className="great-tree-values">{`Subtree values: ${step.values.join(', ')}`}</p>
      )}
    </div>
  )
}
