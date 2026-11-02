import './LonelyNodesView.css'

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

// Tree view: nodes with exactly one child glow, the lonely child is starred, and the checked node is outlined.
export default function LonelyNodesView({ run, step }) {
  const { tree } = run.input
  const { pos, span } = layout(run.kids)
  const xOf = i => 40 + (pos[i].x / span) * (W - 80)
  const yOf = i => 30 + pos[i].depth * ROW
  const height = yOf(0) + Math.max(...Object.values(pos).map(p => p.depth)) * ROW + 50
  const lonely = new Set(step.result)
  const loneChildren = new Set(Object.values(run.kids).filter(c => c.length === 1).map(c => c[0]))
  return (
    <figure className="ln-view">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Binary tree with lonely nodes marked">
        {Object.keys(run.kids).flatMap(parent => run.kids[parent].map(child => (
          <line key={`e-${parent}-${child}`} x1={xOf(Number(parent))} y1={yOf(Number(parent))}
            x2={xOf(child)} y2={yOf(child)} className={run.kids[parent].length === 1 ? 'ln-edge ln-edge--single' : 'ln-edge'} />
        )))}
        {tree.map((value, i) => value === null ? null : (
          <g key={`n-${i}`}>
            <circle cx={xOf(i)} cy={yOf(i)} r={R}
              className={i === step.index ? 'ln-node ln-node--now' : loneChildren.has(i) ? 'ln-node ln-node--lonely' : 'ln-node'} />
            <text x={xOf(i)} y={yOf(i) + 5} textAnchor="middle" className="ln-text">{value}</text>
            {loneChildren.has(i) && <text x={xOf(i) + R - 2} y={yOf(i) - R + 4} className="ln-star">{lonely.has(value) ? '★' : '☆'}</text>}
          </g>
        ))}
      </svg>
      <figcaption>
        Lonely so far: {step.result.length ? step.result.join(', ') : 'none'}. {step.message}
      </figcaption>
    </figure>
  )
}
