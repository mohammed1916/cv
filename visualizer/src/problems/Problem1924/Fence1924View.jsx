const SIZE = 320
const PAD = 26

export default function Fence1924View({ run, step }) {
  const points = run.input
  const circle = step.circle
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])
  const extra = circle ? [circle.center[0] - circle.radius, circle.center[0] + circle.radius] : []
  const extraY = circle ? [circle.center[1] - circle.radius, circle.center[1] + circle.radius] : []
  const minX = Math.min(...xs, ...extra) - 1
  const maxX = Math.max(...xs, ...extra) + 1
  const minY = Math.min(...ys, ...extraY) - 1
  const maxY = Math.max(...ys, ...extraY) + 1
  const span = Math.max(maxX - minX, maxY - minY)
  const scale = (SIZE - PAD * 2) / span
  const sx = x => PAD + (x - minX) * scale
  const sy = y => SIZE - PAD - (y - minY) * scale
  const active = new Map()
  if (step.i >= 0) active.set(step.i, 'i')
  if (step.j >= 0) active.set(step.j, 'j')
  if (step.k >= 0) active.set(step.k, 'k')
  const roleName = { i: 'point i', j: 'point j', k: 'point k' }
  const outside = step.phase === 'outside' || step.phase === 'reset' || step.phase === 'pair' || step.phase === 'triple'
  const label = c => (c === null ? 'no circle' : `center (${c.center[0].toFixed(3)}, ${c.center[1].toFixed(3)}), radius ${c.radius.toFixed(3)}`)

  return (
    <section className="fence1924" aria-label="Minimum enclosing circle">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="fence1924__svg" role="img" aria-label={`Points with circle ${label(circle)}`}>
        <rect x="0" y="0" width={SIZE} height={SIZE} className="fence1924__frame" />
        {circle ? (
          <g className={`fence1924__circle${outside ? ' fence1924__circle--candidate' : ''}`}>
            <circle cx={sx(circle.center[0])} cy={sy(circle.center[1])} r={Math.max(0, circle.radius * scale)} />
            <circle cx={sx(circle.center[0])} cy={sy(circle.center[1])} r="3" className="fence1924__center" />
          </g>
        ) : null}
        {points.map((p, index) => {
          const role = active.get(index)
          return (
            <g key={index} className={`fence1924__point${role ? ` fence1924__point--${role}` : ''}`}>
              <circle cx={sx(p[0])} cy={sy(p[1])} r="6" />
              <text x={sx(p[0]) + 9} y={sy(p[1]) - 7}>{index}{role ? ` (${role})` : ''}</text>
            </g>
          )
        })}
      </svg>
      <p className="fence1924__status" role="status">
        {step.message} Circle: {label(circle)}.
      </p>
      <ul className="fence1924__key" aria-label="Legend">
        <li><span className="fence1924__swatch fence1924__swatch--i" /> {roleName.i}, the point being placed</li>
        <li><span className="fence1924__swatch fence1924__swatch--j" /> {roleName.j}, a boundary candidate</li>
        <li><span className="fence1924__swatch fence1924__swatch--k" /> {roleName.k}, a third boundary point</li>
        <li><span className="fence1924__swatch fence1924__swatch--circle" /> current circle (dashed while a candidate)</li>
      </ul>
    </section>
  )
}
