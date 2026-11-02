import './TreeDeleteView.css'

const W = 640
const ROW = 80
const R = 20

// Tree drawn by depth. Each node shows its value and subtree sum; zero-sum and removed nodes are struck out.
export default function TreeDeleteView({ run, step }) {
  const { parent, value } = run.input
  const n = parent.length
  const depth = Array(n).fill(0)
  for (let v = 1; v < n; v++) {
    let d = 0
    for (let u = v; u !== 0; u = parent[u]) d++
    depth[v] = d
  }
  const rows = []
  for (let v = 0; v < n; v++) (rows[depth[v]] ||= []).push(v)
  const pos = {}
  rows.forEach((row, d) => row.forEach((v, i) => { pos[v] = [((i + 1) / (row.length + 1)) * W, 40 + d * ROW] }))
  const height = 40 + rows.length * ROW
  return (
    <figure className="td-view">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Tree with subtree sums">
        {parent.map((p, v) => v === 0 ? null : (
          <line key={`e-${v}`} x1={pos[p][0]} y1={pos[p][1]} x2={pos[v][0]} y2={pos[v][1]} className="td-edge" />
        ))}
        {Array.from({ length: n }, (_, v) => {
          const [x, y] = pos[v]
          const cls = step.removed[v] ? 'td-node td-node--removed'
            : step.sum[v] === 0 ? 'td-node td-node--zero'
              : step.index === v ? 'td-node td-node--current' : 'td-node'
          return (
            <g key={`n-${v}`}>
              <circle cx={x} cy={y} r={R} className={cls} />
              <text x={x} y={y - 2} textAnchor="middle" className="td-text">{value[v]}</text>
              <text x={x} y={y + 11} textAnchor="middle" className="td-sum">{`Σ ${step.sum[v]}`}</text>
              <text x={x} y={y - R - 4} textAnchor="middle" className="td-tag">{`#${v}`}</text>
              {step.removed[v] && <text x={x} y={y + 4} textAnchor="middle" className="td-cross">✕</text>}
            </g>
          )
        })}
      </svg>
      <figcaption>{step.removed.filter(item => !item).length} of {n} nodes still standing. Red: zero subtree sum. Grey with ✕: deleted.</figcaption>
    </figure>
  )
}
