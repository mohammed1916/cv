import './CircularSplitView.css'

const SIZE = 320
const RADIUS = 115
const NODE_R = 22

function walk(next, start, stop) {
  const seen = []
  const mark = new Set()
  let at = start
  while (!mark.has(at)) {
    mark.add(at)
    seen.push(at)
    at = next[at]
    if (at === stop) break
  }
  return seen
}

export default function CircularSplitView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="cs-view" aria-label="Circular list split">
        <p className="cs-empty">Press Play to count the ring and cut it into two circles.</p>
      </section>
    )
  }

  const { values, next, half, last, second, tail, phase } = step
  const n = values.length
  const center = SIZE / 2
  const pos = i => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: center + RADIUS * Math.cos(angle), y: center + RADIUS * Math.sin(angle) }
  }
  const firstSet = new Set(walk(next, 0, 0))
  const secondSet = second >= 0 ? new Set(walk(next, second, second)) : new Set()
  const groupOf = i => (secondSet.has(i) ? 'second' : firstSet.has(i) ? 'first' : 'ring')
  const cursorTag = i => {
    const tags = []
    if (i === 0) tags.push('head')
    if (i === last) tags.push('last')
    if (i === second) tags.push('second')
    if (i === tail) tags.push('tail')
    return tags.join(' · ')
  }

  return (
    <section className="cs-view" aria-label="Circular list with cut">
      <svg className="cs-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img"
        aria-label={`Circular list of ${n} nodes; phase ${phase}`}>
        <defs>
          <marker id="cs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="cs-arrowhead" />
          </marker>
        </defs>
        {values.map((_, i) => {
          const a = pos(i)
          const b = pos(next[i])
          const dx = b.x - a.x
          const dy = b.y - a.y
          const len = Math.hypot(dx, dy) || 1
          const sx = a.x + (dx / len) * NODE_R
          const sy = a.y + (dy / len) * NODE_R
          const ex = b.x - (dx / len) * (NODE_R + 4)
          const ey = b.y - (dy / len) * (NODE_R + 4)
          const closing = next[i] === 0 && i === last && phase !== 'count' && phase !== 'half' && phase !== 'cut-walk'
          return (
            <line key={`e-${i}`} x1={sx} y1={sy} x2={ex} y2={ey}
              className={`cs-edge${closing ? ' cs-edge--cut' : ''}${i === tail && phase === 'link' ? ' cs-edge--new' : ''}`}
              markerEnd="url(#cs-arrow)" />
          )
        })}
        {values.map((v, i) => {
          const p = pos(i)
          const group = groupOf(i)
          const tag = cursorTag(i)
          const current = (phase === 'count' && i === (step.cursor)) || (phase === 'cut-walk' && i === last)
          return (
            <g key={`n-${i}`} className={`cs-node cs-node--${group}${current ? ' cs-node--current' : ''}`}>
              <circle cx={p.x} cy={p.y} r={NODE_R} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" className="cs-value">{v}</text>
              {tag && <text x={p.x} y={p.y - NODE_R - 6} textAnchor="middle" className="cs-tag">{tag}</text>}
            </g>
          )
        })}
      </svg>
      <p className="cs-status" role="status">{step.message}</p>
      <ul className="cs-lists" aria-label="Lists after the current step">
        <li className="cs-list cs-list--first">
          <span className="cs-list__name">First list</span>
          <span>{[...firstSet].filter(i => !secondSet.has(i)).map(i => values[i]).join(', ') || 'not built yet'}</span>
        </li>
        <li className="cs-list cs-list--second">
          <span className="cs-list__name">Second list</span>
          <span>{second >= 0 ? (secondSet.size ? [...secondSet].map(i => values[i]).join(', ') : 'empty') : 'not started'}</span>
        </li>
      </ul>
      <p className="cs-legend">{`Half is ${half} of ${n} nodes. Green is the first list, violet the second; the dashed red edge is the cut.`}</p>
    </section>
  )
}
