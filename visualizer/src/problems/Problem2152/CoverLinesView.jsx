import './CoverLinesView.css'

const SIZE = 300
const PAD = 24

// Points on a plane with the candidate line under test and the covered points highlighted.
export default function CoverLinesView({ run, step }) {
  const { points } = run.input
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])
  const lo = Math.min(...xs, ...ys) - 1
  const hi = Math.max(...xs, ...ys) + 1
  const span = Math.max(1, hi - lo)
  const sx = x => PAD + ((x - lo) / span) * (SIZE - 2 * PAD)
  const sy = y => SIZE - PAD - ((y - lo) / span) * (SIZE - 2 * PAD)
  const line = step.line
  const covered = k => (step.covered >> k) & 1
  let segment = null
  if (line) {
    const [x1, y1] = points[line.a]
    const [x2, y2] = points[line.b]
    if (line.a === line.b) {
      segment = { x1: sx(x1) - 14, y1: sy(y1) + 14, x2: sx(x1) + 14, y2: sy(y1) - 14, single: true }
    } else {
      const dx = x2 - x1
      const dy = y2 - y1
      segment = { x1: sx(x1 - dx * 5), y1: sy(y1 - dy * 5), x2: sx(x1 + dx * 5), y2: sy(y1 + dy * 5), single: false }
    }
  }
  return (
    <div className="cover-view">
      <svg className="cover-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Points and candidate line">
        {segment && <line className={`cover-line${segment.single ? ' cover-line--single' : ''}`} x1={segment.x1} y1={segment.y1} x2={segment.x2} y2={segment.y2} />}
        {points.map(([x, y], k) => {
          const cls = k === step.target ? 'cover-point cover-point--target' : covered(k) ? 'cover-point cover-point--covered' : 'cover-point'
          return <g key={k}>
            <circle className={cls} cx={sx(x)} cy={sy(y)} r={7} />
            <text x={sx(x) + 9} y={sy(y) - 8} fontSize="12">{k}</text>
          </g>
        })}
      </svg>
      <p className="cover-caption">Covered set: {points.map((_, k) => covered(k) ? k : null).filter(v => v !== null).join(', ') || 'none'}. Lowest uncovered point: {step.target >= 0 ? step.target : '-'}.</p>
      <p className="cover-text">Lines considered: {step.lines.length}. Best value here: {step.value ?? '-'}.</p>
    </div>
  )
}
