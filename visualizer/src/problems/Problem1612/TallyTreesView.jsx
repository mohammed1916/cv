import './TallyTreesView.css'

const W = 300
const ROW = 62
const R = 17

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

function Tree({ tree, kids, which, step }) {
  const { pos, span } = layout(kids)
  const xOf = i => 30 + (pos[i].x / span) * (W - 60)
  const yOf = i => 26 + pos[i].depth * ROW
  const height = yOf(0) + Math.max(...Object.values(pos).map(p => p.depth)) * ROW + 30
  const active = step.tree === which
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`Expression tree ${which + 1}`}>
      {Object.keys(kids).flatMap(p => kids[p].map(c => (
        <line key={`${p}-${c}`} x1={xOf(Number(p))} y1={yOf(Number(p))} x2={xOf(c)} y2={yOf(c)} className="tt-edge" />
      )))}
      {tree.map((value, i) => value === null ? null : (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(i)} r={R}
            className={active && step.node === i ? 'tt-node tt-node--now' : value === '+' ? 'tt-node tt-node--plus' : 'tt-node tt-node--letter'} />
          <text x={xOf(i)} y={yOf(i) + 5} textAnchor="middle" className="tt-text">{value}</text>
        </g>
      ))}
    </svg>
  )
}

// Two expression trees side by side, and a tally table of letter counts for each. Matching columns mean equivalence.
export default function TallyTreesView({ run, step }) {
  const { t1, t2, kids } = step
  const tallies1 = step.counts[0]
  const tallies2 = step.counts[1]
  return (
    <figure className="tt-view">
      <div className="tt-trees">
        <div>
          <h4>Tree 1</h4>
          <Tree tree={t1} kids={kids[0]} which={0} step={step} />
        </div>
        <div>
          <h4>Tree 2</h4>
          <Tree tree={t2} kids={kids[1]} which={1} step={step} />
        </div>
      </div>
      <table className="tt-table">
        <thead><tr><th>letter</th><th>tree 1</th><th>tree 2</th></tr></thead>
        <tbody>
          {run.letters.map(letter => {
            const a = tallies1.get(letter) || 0
            const b = tallies2.get(letter) || 0
            return <tr key={letter}><th>{letter}</th><td>{a}</td><td>{b}</td></tr>
          })}
          {run.letters.length === 0 && <tr><td colSpan={3}>no letters yet</td></tr>}
        </tbody>
      </table>
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
