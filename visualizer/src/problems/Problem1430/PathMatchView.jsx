import './PathMatchView.css'

const W = 640
const ROW = 72
const R = 18

// Leaves take consecutive slots; each parent sits midway between its first and last child.
function layout(kids) {
  const pos = {}
  let leaves = 0
  const place = (i, depth) => {
    const children = kids[i] || []
    if (!children.length) {
      pos[i] = { x: leaves, depth }
      leaves++
      return pos[i].x
    }
    const xs = children.map(child => place(child, depth + 1))
    pos[i] = { x: (xs[0] + xs[xs.length - 1]) / 2, depth }
    return pos[i].x
  }
  place(0, 0)
  return { pos, span: Math.max(1, leaves - 1) }
}

// Tree with the root-to-current path in blue, and the array with the matched prefix above it.
export default function PathMatchView({ run, step }) {
  const { tree, arr } = run.input
  const { pos, span } = layout(run.kids)
  const xOf = i => 40 + (pos[i].x / span) * (W - 80)
  const yOf = i => 30 + pos[i].depth * ROW
  const height = yOf(0) + Math.max(...Object.values(pos).map(p => p.depth)) * ROW + 50
  const onPath = new Set(step.path)
  const nodeClass = i => {
    if (i === step.node) {
      if (step.phase === 'mismatch') return 'pm-node pm-node--bad'
      if (step.phase === 'found') return 'pm-node pm-node--good'
      return 'pm-node pm-node--now'
    }
    return onPath.has(i) ? 'pm-node pm-node--path' : 'pm-node'
  }
  return (
    <figure className="pm-view">
      <div className="pm-array" aria-label="Array to match">
        {arr.map((value, k) => (
          <span key={k} className={`pm-cell${k === step.k ? ' pm-cell--now' : k < step.k ? ' pm-cell--done' : ''}`}>
            <small>{k}</small>{value}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Binary tree and the current root-to-node path">
        {Object.keys(run.kids).flatMap(parent => run.kids[parent].map(child => (
          <line key={`e-${parent}-${child}`} x1={xOf(Number(parent))} y1={yOf(Number(parent))}
            x2={xOf(child)} y2={yOf(child)}
            className={onPath.has(Number(parent)) && onPath.has(child) ? 'pm-edge pm-edge--path' : 'pm-edge'} />
        )))}
        {tree.map((value, i) => value === null ? null : (
          <g key={`n-${i}`}>
            <circle cx={xOf(i)} cy={yOf(i)} r={R} className={nodeClass(i)} />
            <text x={xOf(i)} y={yOf(i) + 5} textAnchor="middle" className="pm-text">{value}</text>
          </g>
        ))}
      </svg>
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
