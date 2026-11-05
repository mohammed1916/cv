import './CloneTreeView.css'

const GAP_X = 58
const GAP_Y = 64
const PAD = 34

// In-order positions for the binary tree rooted at node 0; depth sets the row.
function layout(left, right) {
  const pos = {}
  let slot = 0
  const place = (v, depth) => {
    if (v === -1) return
    place(left[v], depth + 1)
    pos[v] = { x: slot, depth }
    slot++
    place(right[v], depth + 1)
  }
  place(0, 0)
  return pos
}

// Original tree (solid lines are left and right, dashed arcs are random) with copied nodes marked.
export default function CloneTreeView({ run, step }) {
  const { val, left, right, random } = run.input
  const pos = layout(left, right)
  const xOf = v => PAD + pos[v].x * GAP_X
  const yOf = v => PAD + pos[v].depth * GAP_Y
  const width = PAD * 2 + Math.max(...Object.values(pos).map(p => p.x)) * GAP_X
  const height = PAD * 2 + Math.max(...Object.values(pos).map(p => p.depth)) * GAP_Y
  const copied = new Set(step.created)
  const edges = []
  val.forEach((_, v) => {
    if (left[v] !== -1) edges.push(['tree', v, left[v]])
    if (right[v] !== -1) edges.push(['tree', v, right[v]])
  })
  const randoms = val.map((_, v) => [v, random[v]]).filter(([, r]) => r !== -1)
  const copyNo = new Map(step.created.map((orig, k) => [orig, k]))
  return (
    <figure className="ct-view">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Original tree with random pointers">
        <defs>
          <marker id="ct-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="ct-arrowhead" />
          </marker>
        </defs>
        {edges.map(([, a, b]) => <line key={`e-${a}-${b}`} x1={xOf(a)} y1={yOf(a)} x2={xOf(b)} y2={yOf(b)} className="ct-edge" />)}
        {randoms.map(([a, b]) => {
          const x1 = xOf(a), y1 = yOf(a), x2 = xOf(b), y2 = yOf(b)
          const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 26
          return <path key={`r-${a}-${b}`} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} className="ct-random" markerEnd="url(#ct-arrow)" />
        })}
        {val.map((v, i) => (
          <g key={`n-${i}`}>
            <circle cx={xOf(i)} cy={yOf(i)} r={17} className={i === step.node ? 'ct-node ct-node--now' : copied.has(i) ? 'ct-node ct-node--copied' : 'ct-node'} />
            <text x={xOf(i)} y={yOf(i) + 5} textAnchor="middle" className="ct-text">{v}</text>
            <text x={xOf(i)} y={yOf(i) + 34} textAnchor="middle" className="ct-sub">{copied.has(i) ? `copy ${copyNo.get(i)}` : `#${i}`}</text>
          </g>
        ))}
      </svg>
      <figcaption>Solid lines are left and right pointers; dashed arcs are random pointers. Green nodes already have a copy.</figcaption>
    </figure>
  )
}
