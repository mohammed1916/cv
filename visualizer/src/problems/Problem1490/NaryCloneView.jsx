import './NaryCloneView.css'

const W = 640
const ROW = 74
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

// Original tree: created nodes turn green and show their copy number; the node being cloned is amber.
export default function NaryCloneView({ run, step }) {
  if (!run.input.val.length) return <p>The root is null, so the copy is null.</p>
  const { val, children } = run.input
  const { pos, span } = layout(children)
  const xOf = i => 40 + (pos[i].x / span) * (W - 80)
  const yOf = i => 30 + pos[i].depth * ROW
  const height = yOf(0) + Math.max(...Object.values(pos).map(p => p.depth)) * ROW + 50
  return (
    <figure className="nc-view">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="N-ary tree being cloned">
        {children.flatMap((kids, parent) => kids.map(child => (
          <line key={`e-${parent}-${child}`} x1={xOf(parent)} y1={yOf(parent)} x2={xOf(child)} y2={yOf(child)} className="nc-edge" />
        )))}
        {val.map((value, i) => {
          const copied = step.copyOf.has(i)
          const cls = i === step.node ? 'nc-node nc-node--now' : copied ? 'nc-node nc-node--copied' : 'nc-node'
          return (
            <g key={`n-${i}`}>
              <circle cx={xOf(i)} cy={yOf(i)} r={R} className={cls} />
              <text x={xOf(i)} y={yOf(i) + 5} textAnchor="middle" className="nc-text">{value}</text>
              {copied && <text x={xOf(i)} y={yOf(i) + R + 14} textAnchor="middle" className="nc-tag">{`copy ${step.copyOf.get(i)}`}</text>}
            </g>
          )
        })}
      </svg>
      <figcaption>{step.created.length} of {val.length} nodes copied, children kept in order. {step.message}</figcaption>
    </figure>
  )
}
