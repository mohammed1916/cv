import './TreeDiameterView.css'

const W = 360
const LEVEL = 74
const TOP = 36

// Lay the tree out by distance from node 0: one row per depth, nodes spread evenly across the row.
function layout(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const depth = Array(n).fill(-1)
  depth[0] = 0
  const order = [0]
  for (let h = 0; h < order.length; h++) for (const v of adj[order[h]]) if (depth[v] < 0) { depth[v] = depth[order[h]] + 1; order.push(v) }
  const rows = []
  for (const v of order) (rows[depth[v]] ||= []).push(v)
  const pos = []
  rows.forEach((row, d) => row.forEach((v, i) => { pos[v] = [((i + 1) * W) / (row.length + 1), TOP + d * LEVEL] }))
  return { pos, height: TOP + rows.length * LEVEL, adj }
}

export default function TreeDiameterView({ run, step }) {
  if (!run || !step) return <p className="td-empty">Press Play to find the two diameter endpoints.</p>
  const { n, edges } = run.input
  const { pos, height } = layout(n, edges)
  const endpoints = step.phase === 'done' ? run.result : [step.phase === 'pickB' ? step.current : null].filter(v => v !== null)
  const source = step.source
  const label = v => (step.dist[v] === -1 || step.dist[v] === undefined ? '' : `d=${step.dist[v]}`)
  return (
    <section className="td" aria-label="Tree with breadth-first distances">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Tree">
        {edges.map(([u, v]) => (
          <line key={`${u}-${v}`} x1={pos[u][0]} y1={pos[u][1]} x2={pos[v][0]} y2={pos[v][1]} className="td-edge" />
        ))}
        {pos.map(([x, y], v) => {
          const current = step.current === v
          const isSource = source === v
          const isEnd = endpoints.includes(v)
          return (
            <g key={v}>
              <circle cx={x} cy={y} r="18" className={`td-node${current ? ' td-node--current' : ''}${isSource ? ' td-node--source' : ''}${isEnd ? ' td-node--end' : ''}`} />
              <text x={x} y={y + 4} className="td-id">{v}</text>
              <text x={x} y={y + 34} className="td-dist">{label(v)}</text>
            </g>
          )
        })}
      </svg>
      <p className="td-queue">Queue: {step.queue.length ? step.queue.join(', ') : 'empty'}</p>
      <p className="td-message">{step.message}</p>
    </section>
  )
}
