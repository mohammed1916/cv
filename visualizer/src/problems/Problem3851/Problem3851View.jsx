import './Problem3851View.css'

const WIDTH = 640
const PAD = 64
const ROW = 58

// Each user gets a timeline. Kept requests are green with a tick, dropped ones are red with a cross.
export default function Problem3851View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="rq-view" aria-label="Request timelines">
        <p className="rq-empty">Press Play to walk each user's requests in time order and keep or drop them.</p>
      </section>
    )
  }

  const { requests, k, span } = run.input
  const users = [...new Set(requests.map(([user]) => user))]
  const maxT = Math.max(...requests.map(([, time]) => time), 1)
  const x = t => PAD + (t / maxT) * (WIDTH - PAD * 2)
  const height = 40 + users.length * ROW
  const rowY = user => 40 + users.indexOf(user) * ROW + ROW / 2

  return (
    <section className="rq-view" aria-label="Request timelines per user">
      <p className="rq-rule">Each user may have at most {k} kept request{k === 1 ? '' : 's'} in any window of length {span}, counted inclusively.</p>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`Timeline with ${requests.length} requests`}>
        {step.user !== null && step.lo !== null && step.hi !== null && (
          <rect className="rq-band" x={x(Math.max(step.lo, 0))} y={rowY(step.user) - 22} width={Math.max(x(step.hi) - x(Math.max(step.lo, 0)), 2)} height={44} rx={6} />
        )}
        {users.map(user => (
          <g key={user}>
            <text className="rq-label" x={8} y={rowY(user) + 5}>{user}</text>
            <line className="rq-axis" x1={PAD} x2={WIDTH - PAD} y1={rowY(user)} y2={rowY(user)} />
            {user === step.user && <rect className="rq-current-row" x={2} y={rowY(user) - 26} width={WIDTH - 4} height={52} rx={8} />}
          </g>
        ))}
        {requests.map(([user, time], i) => {
          const status = step.status[i]
          const cx = x(time)
          const cy = rowY(user)
          const isCompare = step.compare === i
          return (
            <g key={i} className={`rq-req rq-req--${status}${step.cur === i ? ' rq-req--cur' : ''}`}>
              {isCompare && <rect className="rq-compare" x={cx - 9} y={cy - 9} width={18} height={18} transform={`rotate(45 ${cx} ${cy})`} />}
              <circle cx={cx} cy={cy} r={11} />
              <text className="rq-mark" x={cx} y={cy + 4} textAnchor="middle">
                {status === 'keep' ? '✓' : status === 'drop' ? '✕' : ''}
              </text>
              <text className="rq-time" x={cx} y={cy + 28} textAnchor="middle">{time}</text>
            </g>
          )
        })}
      </svg>
      <p className="rq-total" aria-label="Running total">Kept so far: {step.total}</p>
      <ul className="rq-legend">
        <li><span className="rq-swatch rq-swatch--keep" /> kept</li>
        <li><span className="rq-swatch rq-swatch--drop" /> dropped</li>
        <li><span className="rq-swatch rq-swatch--cur" /> being checked</li>
        <li><span className="rq-swatch rq-swatch--compare" /> k-th last kept time</li>
      </ul>
    </section>
  )
}
