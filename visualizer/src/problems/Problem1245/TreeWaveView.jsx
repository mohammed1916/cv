import './TreeWaveView.css'

const GAP_X = 50
const GAP_Y = 62
const PAD = 30

// Lay the tree out from node 0: depth sets the row, and leaves are spaced left to right.
function layout(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const pos = Array(n).fill(null)
  let leaf = 0
  function place(v, parent, depth) {
    const children = adj[v].filter(w => w !== parent)
    if (!children.length) {
      pos[v] = { x: leaf, y: depth }
      leaf += 1
      return pos[v].x
    }
    const xs = children.map(w => place(w, v, depth + 1))
    pos[v] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth }
    return pos[v].x
  }
  place(0, -1, 0)
  return { pos, adj }
}

export default function TreeWaveView({ run, step }) {
  const { n, edges } = run.input
  const { pos, adj } = layout(n, edges)
  const maxX = Math.max(...pos.map(p => p.x))
  const maxY = Math.max(...pos.map(p => p.y))
  const width = maxX * GAP_X + PAD * 2
  const height = maxY * GAP_Y + PAD * 2
  const at = v => ({ x: PAD + pos[v].x * GAP_X, y: PAD + pos[v].y * GAP_Y })
  const onPath = new Set(step.path)
  const pathEdge = (a, b) => onPath.has(a) && onPath.has(b) && Math.abs(step.dist[a] - step.dist[b]) === 1
  return <div className="wave-view">
    <p className="wave-view__label">{step.wave === 'first' ? 'First sweep from node 0' : step.wave === 'second' ? `Second sweep from node ${step.source}` : 'Waiting'}</p>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tree with ${n} nodes; ${step.result !== undefined ? `diameter ${step.result}` : 'searching'}`}>
      {edges.map(([a, b]) => {
        const p = at(a)
        const q = at(b)
        return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y}
          className={`wave-view__edge${pathEdge(a, b) ? ' is-path' : ''}`} />
      })}
      {Array.from({ length: n }, (_, v) => {
        const { x, y } = at(v)
        const classes = ['wave-view__node']
        if (step.dist[v] >= 0) classes.push('is-reached')
        if (step.current === v) classes.push('is-current')
        if (step.far === v) classes.push('is-far')
        if (onPath.has(v)) classes.push('is-path')
        return <g key={v} className={classes.join(' ')}>
          <circle cx={x} cy={y} r="15" />
          <text x={x} y={y - 2} textAnchor="middle" className="wave-view__id">{v}</text>
          <text x={x} y={y + 10} textAnchor="middle" className="wave-view__dist">{step.dist[v] >= 0 ? `d${step.dist[v]}` : ''}</text>
        </g>
      })}
    </svg>
    <output aria-label="Sweep readout">
      {step.result !== undefined ? `diameter = ${step.result} edges (path ${step.path.slice().reverse().join(' – ')})` : `${adj.reduce((s, list) => s + list.length, 0) / 2} edges · ${step.dist.filter(d => d >= 0).length} reached`}
    </output>
  </div>
}
