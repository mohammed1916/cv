import './CircleSplitView.css'

const RADIUS = 110
const CENTER = 140

// Points sit on a circle. The active sub-circle is the first 2p points, and the chord from
// person 0 to its partner splits the rest into an inside arc and an outside arc.
export default function CircleSplitView({ run, step }) {
  const n = run.input
  const points = Array.from({ length: n }, (_, k) => {
    const angle = (2 * Math.PI * k) / n - Math.PI / 2
    return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle), k }
  })
  const active = step.people || 0
  const inside = step.partner >= 0 ? step.partner - 1 : 0
  const outside = step.partner >= 0 ? active - step.partner - 1 : 0
  return <div className="split-view">
    <svg viewBox="0 0 280 280" role="img" aria-label={`${n} people on a circle; ${active ? `first ${active} in the current count` : 'no count yet'}`}>
      {points.map(point => {
        const isActive = point.k < active
        const classes = ['split-view__point']
        if (isActive) classes.push('is-active')
        if (point.k === 0) classes.push('is-zero')
        if (point.k === step.partner) classes.push('is-partner')
        return <g key={point.k} className={classes.join(' ')}>
          <circle cx={point.x} cy={point.y} r="12" />
          <text x={point.x} y={point.y + 4} textAnchor="middle">{point.k}</text>
        </g>
      })}
      {step.partner >= 0 && <line className="split-view__chord" x1={points[0].x} y1={points[0].y} x2={points[step.partner].x} y2={points[step.partner].y} />}
      {step.partner >= 0 && <text x={CENTER} y={CENTER - 4} textAnchor="middle" className="split-view__arc">inside {inside} · outside {outside}</text>}
    </svg>
    <table aria-label="Pairings table">
      <thead><tr><th scope="col">size</th><th scope="col">pairings</th></tr></thead>
      <tbody>
        {step.dp.map((value, size) => <tr key={size} className={size === step.p ? 'is-row' : ''}>
          <th scope="row">{2 * size}</th><td>{value}</td>
        </tr>)}
      </tbody>
    </table>
    <output aria-label="Split readout">
      {step.term !== null
        ? `split ${step.i}: ${step.p - 1 - step.i >= 0 ? `dp[${step.i}] × dp[${step.p - 1 - step.i}] = ${step.term}` : ''} · total ${step.total}`
        : step.p >= 0 ? `size ${2 * step.p}` : 'reading n'}
    </output>
  </div>
}
