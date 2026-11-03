const X_GAP = 56
const Y_GAP = 66
const PAD = 34

// Lay the tree out in order: each node's x position is its in-order rank, y is its depth.
function layout(nodes, root) {
  const left = new Map()
  const right = new Map()
  const depth = new Map()
  for (const n of nodes) {
    depth.set(n.val, n.depth)
    if (n.parent !== null) (n.side === 'left' ? left : right).set(n.parent, n.val)
  }
  const rank = new Map()
  const order = []
  const walk = v => {
    if (v === null || v === undefined) return
    walk(left.get(v))
    rank.set(v, order.length)
    order.push(v)
    walk(right.get(v))
  }
  walk(root)
  return { rank, depth, order }
}

export default function Tree1902View({ run, step }) {
  const { rank, depth, order } = layout(step.nodes, step.root)
  const maxDepth = Math.max(1, ...depth.values())
  const width = Math.max(1, order.length) * X_GAP + PAD * 2
  const height = maxDepth * Y_GAP + PAD
  const xy = v => ({ x: PAD + rank.get(v) * X_GAP, y: PAD + (depth.get(v) - 1) * Y_GAP })
  const onPath = new Set(step.path)
  const attachedLine = step.phase === 'attach' ? step.attached : null
  const edges = step.nodes.filter(n => n.parent !== null)

  return (
    <section className="tree1902" aria-label="Binary search tree built from insertion order">
      <div className="tree1902__queue" aria-label="Insertion order">
        {run.input.map((v, i) => {
          const done = i < run.input.indexOf(step.value ?? -1) || (step.value === null && step.phase === 'done')
          const isCurrent = v === step.value
          return (
            <span key={v} className={`tree1902__token${isCurrent ? ' tree1902__token--current' : ''}${done ? ' tree1902__token--done' : ''}`}>
              {isCurrent ? 'next ' : ''}{v}
            </span>
          )
        })}
      </div>
      <svg className="tree1902__svg" viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={`Tree with ${step.nodes.length} nodes, depth so far ${step.best}`}>
        {edges.map(n => {
          const a = xy(n.parent)
          const b = xy(n.val)
          return <line key={`e${n.val}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="tree1902__edge" />
        })}
        {step.nodes.map(n => {
          const { x, y } = xy(n.val)
          const cls = [
            'tree1902__node',
            n.val === step.cur ? 'tree1902__node--cur' : '',
            onPath.has(n.val) ? 'tree1902__node--path' : '',
            n.val === attachedLine ? 'tree1902__node--new' : '',
          ].join(' ')
          return (
            <g key={n.val} className={cls} transform={`translate(${x} ${y})`}>
              <circle r="18" />
              <text y="5" textAnchor="middle">{n.val}</text>
            </g>
          )
        })}
      </svg>
      <p className="tree1902__status" role="status">
        {step.value !== null && step.value !== undefined ? `Value ${step.value}. ` : ''}
        {step.message} Deepest depth so far: {step.best}.
        {step.phase === 'done' ? ` Answer: ${run.result}.` : ''}
      </p>
      <ul className="tree1902__key" aria-label="Legend">
        <li><span className="tree1902__swatch tree1902__swatch--cur" /> cur (being compared)</li>
        <li><span className="tree1902__swatch tree1902__swatch--path" /> visited on the way down</li>
        <li><span className="tree1902__swatch tree1902__swatch--new" /> newly attached value</li>
      </ul>
    </section>
  )
}
