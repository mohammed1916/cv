import './Problem3879View.css'

const GAP_X = 58
const GAP_Y = 70
const PAD = 40

// Lay the tree out by in-order position (x) and depth (y). The current path is drawn as a thick route,
// the best route so far in green, and a repeated value as a blocked node.
export default function Problem3879View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="tp-view" aria-label="Binary tree path sums">
        <p className="tp-empty">Press Play to try every starting node and grow simple paths that never repeat a value.</p>
      </section>
    )
  }

  const { tree } = run.input
  const nodes = []
  const pos = new Map()
  const build = (index, depth) => {
    if (index >= tree.length || tree[index] === null) return null
    const node = { id: nodes.length, val: tree[index], depth }
    nodes.push(node)
    return node
  }
  // Rebuild the same nodes in level order, assigning ids the same way as algorithm.js.
  const queue = []
  const root = build(0, 0)
  if (root) queue.push({ node: root, slot: 0 })
  let next = 1
  for (let q = 0; q < queue.length; q += 1) {
    const { node, slot } = queue[q]
    for (const side of [0, 1]) {
      if (next >= tree.length) break
      const child = build(next, node.depth + 1)
      next += 1
      if (child) {
        node.children = node.children || []
        node.children[side] = child
        queue.push({ node: child, slot: side })
      }
    }
  }
  let order = 0
  const walk = node => {
    if (!node) return
    walk(node.children?.[0])
    pos.set(node.id, { x: PAD + order * GAP_X, y: PAD + node.depth * GAP_Y })
    order += 1
    walk(node.children?.[1])
  }
  walk(root)
  const maxDepth = Math.max(0, ...nodes.map(n => n.depth))
  const width = PAD * 2 + Math.max(order - 1, 0) * GAP_X + GAP_X
  const height = PAD * 2 + maxDepth * GAP_Y + 20
  const onPath = new Set(step.path)
  const bestSet = new Set(step.bestPath)
  const edges = nodes.flatMap(n => (n.children || []).filter(Boolean).map(c => [n.id, c.id]))

  return (
    <section className="tp-view" aria-label="Path search in the tree">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Binary tree with ${nodes.length} nodes`}>
        {edges.map(([a, b]) => {
          const pa = pos.get(a)
          const pb = pos.get(b)
          const cls = onPath.has(a) && onPath.has(b) ? 'tp-edge tp-edge--path' : bestSet.has(a) && bestSet.has(b) ? 'tp-edge tp-edge--best' : 'tp-edge'
          return <line key={`${a}-${b}`} className={cls} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />
        })}
        {nodes.map(n => {
          const p = pos.get(n.id)
          const cls = [
            'tp-node',
            n.id === step.start ? 'tp-node--start' : '',
            n.id === step.blocked ? 'tp-node--blocked' : '',
            n.id === step.cur ? 'tp-node--cur' : '',
            bestSet.has(n.id) ? 'tp-node--best' : '',
            onPath.has(n.id) && !bestSet.has(n.id) ? 'tp-node--path' : '',
          ].filter(Boolean).join(' ')
          return (
            <g key={n.id} className={cls}>
              <circle cx={p.x} cy={p.y} r={18} />
              <text x={p.x} y={p.y + 5} textAnchor="middle">{n.val}</text>
            </g>
          )
        })}
      </svg>
      <p className="tp-message">{step.message}</p>
      <dl className="tp-facts">
        <dt>Path sum</dt><dd>{step.path.length ? step.sum : '-'}</dd>
        <dt>Best so far</dt><dd>{step.best === -Infinity ? '-' : step.best}</dd>
        <dt>Start</dt><dd>{step.start >= 0 ? `node ${step.start}` : '-'}</dd>
      </dl>
      <ul className="tp-legend">
        <li><span className="tp-swatch tp-swatch--start" /> start</li>
        <li><span className="tp-swatch tp-swatch--path" /> on the path</li>
        <li><span className="tp-swatch tp-swatch--best" /> best so far</li>
        <li><span className="tp-swatch tp-swatch--blocked" /> repeated value</li>
      </ul>
    </section>
  )
}
