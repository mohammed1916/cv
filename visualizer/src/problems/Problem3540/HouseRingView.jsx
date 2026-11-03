import './HouseRingView.css'

const SIZE = 300
const CENTER = SIZE / 2
const RING = 105

function place(n, i) {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
  return { x: CENTER + RING * Math.cos(angle), y: CENTER + RING * Math.sin(angle) }
}

export default function HouseRingView({ run, step }) {
  const { forward, queries } = run.input
  const n = forward.length
  const q = queries.length
  const points = Array.from({ length: n }, (_, i) => place(n, i))
  const queryOrder = house => queries.map((h, k) => (h === house ? k + 1 : null)).filter(x => x !== null)
  return (
    <figure className="house-ring-view">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Ring of ${n} houses; the walker is at house ${step.house ?? 'none'}`}>
        <circle cx={CENTER} cy={CENTER} r={RING} className="house-ring-view__track" />
        {points.map((p, i) => {
          const order = queryOrder(i)
          const cls = ['house', i === step.house ? 'house--here' : '', order.length ? 'house--query' : ''].join(' ').trim()
          return (
            <g key={i} className={cls}>
              <circle cx={p.x} cy={p.y} r={22} />
              <text x={p.x} y={p.y - 2}>{`h${i}`}</text>
              <text className="house-ring-view__order" x={p.x} y={p.y + 11}>{order.length ? `q${order.join(',')}` : ''}</text>
            </g>
          )
        })}
        {step.from !== undefined && step.house !== undefined && step.from !== null ? (
          <text className="house-ring-view__move" x={CENTER} y={CENTER + 4}>{`${step.direction} move`}</text>
        ) : null}
      </svg>
      <div className="house-ring-view__table" role="table" aria-label="Best time per house and queries reached">
        <div role="row" className="house-ring-view__row house-ring-view__row--head">
          <span role="columnheader">house</span>
          {Array.from({ length: q + 1 }, (_, k) => <span key={k} role="columnheader">{`${k} done`}</span>)}
        </div>
        {step.best.map((row, h) => (
          <div key={h} role="row" className="house-ring-view__row">
            <span role="rowheader">{`h${h}`}</span>
            {row.map((time, k) => {
              const cls = ['cell', h === step.house && k === step.done ? 'cell--current' : '', step.settled[h][k] ? 'cell--settled' : ''].join(' ').trim()
              return <span key={k} role="cell" className={cls}>{time === null ? '-' : time}</span>
            })}
          </div>
        ))}
      </div>
      <p className="house-ring-view__note">{`Queries in order: ${queries.join(', ')}. Visited so far: ${step.done ?? 0} of ${q}.`}</p>
    </figure>
  )
}
