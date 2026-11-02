import './HeightPairView.css'

const W = 640
const ROW = 74
const R = 19

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

// Each node shows its height once measured. The node being combined draws its two tallest branches in gold.
export default function HeightPairView({ run, step }) {
  const { children } = run.input
  const { pos, span } = layout(children)
  const xOf = i => 40 + (pos[i].x / span) * (W - 80)
  const yOf = i => 30 + pos[i].depth * ROW
  const height = yOf(0) + Math.max(...Object.values(pos).map(p => p.depth)) * ROW + 70
  const pairEdge = (p, c) => step.phase === 'combine' && p === step.node && (c === step.firstChild || c === step.secondChild)
  return (
    <figure className="hp-view">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="N-ary tree with heights and the current pair of branches">
        {children.flatMap((kids, parent) => kids.map(child => (
          <line key={`e-${parent}-${child}`} x1={xOf(parent)} y1={yOf(parent)} x2={xOf(child)} y2={yOf(child)}
            className={pairEdge(parent, child) ? 'hp-edge hp-edge--pair' : 'hp-edge'} />
        )))}
        {children.map((_, i) => (
          <g key={`n-${i}`}>
            <circle cx={xOf(i)} cy={yOf(i)} r={R}
              className={i === step.node ? 'hp-node hp-node--now' : step.height[i] !== null ? 'hp-node hp-node--done' : 'hp-node'} />
            <text x={xOf(i)} y={yOf(i) + 5} textAnchor="middle" className="hp-text">{i}</text>
            <text x={xOf(i)} y={yOf(i) + R + 14} textAnchor="middle" className="hp-height">
              {step.height[i] === null ? 'h ?' : `h ${step.height[i]}`}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>Best diameter so far: <strong>{step.best}</strong> edges. {step.message}</figcaption>
    </figure>
  )
}
