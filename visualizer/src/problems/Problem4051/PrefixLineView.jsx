import './PrefixLineView.css'

// Prefix sums on a number line. The shaded band is the close interval; points outside it are distant.
export default function PrefixLineView({ run, step }) {
  const { nums, goal, k } = run.input
  const all = run.prefixes
  const lo0 = Math.min(...all, step.lo ?? Infinity) - 2
  const hi0 = Math.max(...all, step.hi ?? -Infinity) + 2
  const width = 560
  const pad = 24
  const span = Math.max(1, hi0 - lo0)
  const x = v => pad + ((v - lo0) / span) * (width - 2 * pad)

  return (
    <section className="pl" aria-label="Prefix sums and the close band">
      <svg className="pl-svg" viewBox={`0 0 ${width} 120`} role="img" aria-label={`Prefix sums on a line; goal ${goal}, k ${k}`}>
        <line x1={pad} x2={width - pad} y1={70} y2={70} className="pl-axis" />
        {step.lo !== null && step.hi !== null ? (
          <rect x={x(step.lo)} width={Math.max(0, x(step.hi) - x(step.lo))} y={40} height={60} className="pl-band" />
        ) : null}
        {step.seen.map((v, i) => (
          <g key={`s${i}`} className="pl-seen">
            <circle cx={x(v)} cy={70} r={6} className={step.lo !== null && v > step.lo && v < step.hi ? 'pl-dot pl-dot--close' : 'pl-dot'} />
          </g>
        ))}
        {step.prefix !== undefined && step.j > 0 ? (
          <g className="pl-now">
            <circle cx={x(step.prefix)} cy={70} r={9} className="pl-current" />
            <text x={x(step.prefix)} y={24} textAnchor="middle">P{step.j}={step.prefix}</text>
          </g>
        ) : null}
        <text x={pad} y={110} className="pl-caption">band = ({step.lo ?? '-'}, {step.hi ?? '-'}) exclusive</text>
      </svg>

      <ul className="pl-facts">
        <li>Prefix sums so far: {step.seen.join(', ')}</li>
        <li>Close (too near goal): {step.close ?? '-'}</li>
        <li>Distant subarrays so far: {step.answer}</li>
      </ul>
      <p className="pl-note">{nums.length} value{nums.length === 1 ? '' : 's'}; a subarray is distant when its sum is at least {k} away from {goal}.</p>
    </section>
  )
}
