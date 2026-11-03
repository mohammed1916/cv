import './LevelMedianView.css'

const GAP_X = 44
const GAP_Y = 62
const LEFT = 30
const TOP = 30

export default function LevelMedianView({ run, step }) {
  if (!run || !step) return <p className="lm-empty">Press Play to build the tree and read one level.</p>
  const nodes = step.nodes
  const present = new Set(step.present)
  const maxRank = Math.max(0, ...nodes.map(n => n.rank))
  const maxDepth = Math.max(0, ...nodes.map(n => n.depth))
  const width = LEFT * 2 + maxRank * GAP_X
  const height = TOP * 2 + maxDepth * GAP_Y
  const xy = n => [LEFT + n.rank * GAP_X, TOP + n.depth * GAP_Y]
  const visible = nodes.filter(n => present.has(n.id))
  const found = new Set(step.found)
  return (
    <section className="lm" aria-label="Binary search tree with the chosen level">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Binary search tree">
        {visible.filter(n => n.parent !== null && present.has(n.parent)).map(n => {
          const [x1, y1] = xy(nodes[n.parent])
          const [x2, y2] = xy(n)
          return <line key={`e${n.id}`} x1={x1} y1={y1} x2={x2} y2={y2} className="lm-edge" />
        })}
        {visible.map(n => {
          const [x, y] = xy(n)
          const onLevel = n.depth === step.level
          const isCurrent = step.current === n.id
          return (
            <g key={n.id}>
              <circle cx={x} cy={y} r="16" className={`lm-node${onLevel ? ' lm-node--level' : ''}${isCurrent ? ' lm-node--current' : ''}${found.has(n.val) && onLevel ? ' lm-node--found' : ''}`} />
              <text x={x} y={y + 4} className="lm-label">{n.val}</text>
            </g>
          )
        })}
      </svg>
      <p className="lm-found">
        Level {step.level} values so far: {step.found.length ? step.found.join(', ') : 'none'}
      </p>
      {step.sorted ? (
        <p className="lm-sorted">
          Sorted: {step.sorted.map((v, i) => (i === step.pickIndex ? <strong key={i}>[{v}]</strong> : <span key={i}>{v} </span>))}
        </p>
      ) : null}
      <p className="lm-message">{step.message}</p>
    </section>
  )
}
