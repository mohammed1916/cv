import './MountainView.css'

const STATUS_LABEL = { open: 'not checked', visible: 'visible', hidden: 'hidden' }

export default function MountainView({ run, step }) {
  if (!run || !step) return null
  const peaks = run.input
  const xs = peaks.flatMap(([x, y]) => [x - y, x + y])
  const minX = Math.min(0, ...xs) - 1
  const maxX = Math.max(...xs) + 1
  const maxY = Math.max(...peaks.map(([, y]) => y)) + 1
  const W = 560
  const H = 240
  const pad = 26
  const sx = x => pad + ((x - minX) / (maxX - minX)) * (W - 2 * pad)
  const sy = y => H - pad - (y / maxY) * (H - 2 * pad)
  const groundY = sy(0)
  const { current, other, covered, status, left, right } = step

  return (
    <div className="mountain-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mountains as triangles on the ground">
        <line x1={pad} x2={W - pad} y1={groundY} y2={groundY} className="mountain-view__ground" />
        <text x={pad} y={groundY + 16} className="mountain-view__axis">ground y = 0</text>
        {peaks.map(([x, y], i) => {
          const classes = [
            'mountain-view__peak',
            `is-${status[i]}`,
            i === current ? 'is-current' : '',
            i === other ? 'is-other' : '',
          ].join(' ')
          const points = `${sx(x - y)},${groundY} ${sx(x)},${sy(y)} ${sx(x + y)},${groundY}`
          return (
            <g key={i}>
              <polygon points={points} className={classes} />
              <text x={sx(x)} y={sy(y) - 8} textAnchor="middle" className="mountain-view__label">
                {`#${i} (${x},${y})`}
              </text>
              <text x={sx(x)} y={sy(y) + 16} textAnchor="middle" className="mountain-view__tag">
                {STATUS_LABEL[status[i]]}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mountain-view__detail" aria-live="polite">
        {current >= 0
          ? `Mountain ${current} interval [${left[current]}, ${right[current]}]`
          : 'Each mountain owns a ground interval.'}
        {other >= 0 && covered !== null
          ? ` - mountain ${other} [${left[other]}, ${right[other]}] ${covered ? 'covers it' : 'does not cover it'}.`
          : ''}
      </p>
      <output aria-label="Visible count">{`Visible so far: ${step.visible}`}</output>
    </div>
  )
}
