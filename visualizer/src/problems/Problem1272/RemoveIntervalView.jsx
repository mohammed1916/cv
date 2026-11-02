import './RemoveIntervalView.css'

const WIDTH = 640
const PAD = 36
const SPAN = 30
const x = value => PAD + (value / SPAN) * (WIDTH - 2 * PAD)

// Number line: the cut in red, the input intervals in blue, the surviving pieces in green.
export default function RemoveIntervalView({ run, step }) {
  const [a, b] = run.input.toBeRemoved
  return (
    <figure className="ri-view">
      <svg viewBox={`0 0 ${WIDTH} 190`} role="img" aria-label={`Cut from ${a} to ${b} applied to the intervals`}>
        <text x={PAD} y={16} className="ri-label">Cut [{a}, {b})</text>
        <rect x={x(a)} y={22} width={x(b) - x(a)} height={22} className="ri-cut" />
        <text x={PAD} y={68} className="ri-label">Input intervals</text>
        {run.input.intervals.map(([s, e], index) => (
          <g key={`in-${index}`}>
            <rect x={x(s)} y={74} width={x(e) - x(s)} height={22}
              className={step.index === index ? 'ri-input ri-input--current' : 'ri-input'} />
            <text x={(x(s) + x(e)) / 2} y={90} textAnchor="middle" className="ri-tag">{index}</text>
          </g>
        ))}
        <text x={PAD} y={130} className="ri-label">Surviving pieces</text>
        {step.result.map(([s, e], index) => (
          <rect key={`out-${index}`} x={x(s)} y={136} width={Math.max(2, x(e) - x(s))} height={22} className="ri-output" />
        ))}
        {[0, 5, 10, 15, 20, 25, 30].map(tick => (
          <text key={tick} x={x(tick)} y={182} textAnchor="middle" className="ri-tick">{tick}</text>
        ))}
      </svg>
      <figcaption>
        {step.result.length ? `Pieces so far: ${step.result.map(([s, e]) => `[${s}, ${e})`).join(' ')}` : 'No pieces kept yet.'}
      </figcaption>
    </figure>
  )
}
