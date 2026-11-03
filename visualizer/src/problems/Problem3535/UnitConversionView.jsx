import './UnitConversionView.css'

const SIZE = 320
const CENTER = SIZE / 2
const RING = 115

function place(n, i) {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
  return { x: CENTER + RING * Math.cos(angle), y: CENTER + RING * Math.sin(angle) }
}

export default function UnitConversionView({ run, step }) {
  const { n, conversions, queries } = run.input
  const points = Array.from({ length: n }, (_, i) => place(n, i))
  const isActive = ([a, b, f]) => step.edge && step.edge[0] === a && step.edge[1] === b && step.edge[2] === f
  return (
    <figure className="unit-conversion-view">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Conversion tree over ${n} units`}>
        {conversions.map(conversion => {
          const [a, b, f] = conversion
          const from = points[a]
          const to = points[b]
          const active = isActive(conversion)
          return (
            <g key={`${a}-${b}`} className={active ? 'edge edge--active' : 'edge'}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}>{`${a} to ${b} x${f}`}</text>
            </g>
          )
        })}
        {points.map((p, i) => {
          const valued = step.amount[i] !== null
          const className = ['unit', i === step.current ? 'unit--current' : '', valued ? 'unit--valued' : ''].join(' ').trim()
          return (
            <g key={i} className={className}>
              <circle cx={p.x} cy={p.y} r={26} />
              <text className="unit-name" x={p.x} y={p.y - 3}>{`unit ${i}`}</text>
              <text className="unit-amount" x={p.x} y={p.y + 12}>{valued ? step.amount[i] : 'none'}</text>
            </g>
          )
        })}
      </svg>
      <ol className="unit-conversion-view__queries" aria-label="Queries">
        {queries.map(([a, b], k) => (
          <li key={k} className={step.answers[k] !== null ? 'query query--done' : 'query'}>
            {`[${a}, ${b}] = ${step.answers[k] !== null ? step.answers[k] : 'pending'}`}
          </li>
        ))}
      </ol>
    </figure>
  )
}
