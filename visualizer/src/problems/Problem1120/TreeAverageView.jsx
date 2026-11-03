import './TreeAverageView.css'

const WIDTH = 520
const ROW = 74

// Lay the tree out by depth (rows) and in-order position (columns).
function layout(nodes, rootId) {
  const byId = new Map(nodes.map(n => [n.id, n]))
  const pos = new Map()
  let column = 0
  const walk = (id, depth) => {
    if (id === null || id === undefined) return
    const node = byId.get(id)
    walk(node.left, depth + 1)
    pos.set(id, { x: 0, y: depth, col: column++ })
    walk(node.right, depth + 1)
  }
  walk(rootId, 0)
  const cols = Math.max(column, 1)
  for (const p of pos.values()) p.x = 40 + (p.col * (WIDTH - 80)) / Math.max(cols - 1, 1)
  return pos
}

export default function TreeAverageView({ run, step }) {
  const pos = layout(run.nodes, run.root)
  const depth = Math.max(...[...pos.values()].map(p => p.y), 0)
  const height = 60 + depth * ROW
  const bestId = step.best ? step.best.id : null
  const sumRow = id => step.done[id]
  const finished = new Set(Object.keys(step.done).map(Number))
  const edges = run.nodes.flatMap(n => [n.left, n.right].filter(c => c !== null).map(c => [n.id, c]))

  return (
    <figure className="tree-average" aria-label="Binary tree with subtree averages">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="Tree nodes and their subtree averages">
        {edges.map(([a, b]) => {
          const pa = pos.get(a), pb = pos.get(b)
          return <line key={`${a}-${b}`} x1={pa.x} y1={40 + pa.y * ROW} x2={pb.x} y2={40 + pb.y * ROW} className="edge" />
        })}
        {run.nodes.map(n => {
          const p = pos.get(n.id)
          const cx = p.x, cy = 40 + p.y * ROW
          const current = step.node === n.id
          const isBest = bestId === n.id
          const isDone = finished.has(n.id)
          const cls = ['node', current ? 'current' : '', isBest ? 'best' : '', isDone && !isBest ? 'done' : ''].join(' ')
          const d = sumRow(n.id)
          return (
            <g key={n.id} className={cls}>
              <circle cx={cx} cy={cy} r="20" />
              <text x={cx} y={cy + 5} textAnchor="middle" className="value">{n.val}</text>
              {d && <text x={cx} y={cy + 36} textAnchor="middle" className="avg">{`${d.total}/${d.size}`}</text>}
            </g>
          )
        })}
      </svg>
      <ul className="legend" aria-label="Legend">
        <li><span className="swatch current" />Current node</li>
        <li><span className="swatch done" />Finished subtree</li>
        <li><span className="swatch best" />Best average so far</li>
      </ul>
      <output aria-label="Averages">
        {`best = ${step.best && step.best.value !== null ? step.best.value.toFixed(5) : 'none yet'}`}
        {step.average !== undefined ? `, this average = ${step.average.toFixed(5)}` : ''}
      </output>
    </figure>
  )
}
