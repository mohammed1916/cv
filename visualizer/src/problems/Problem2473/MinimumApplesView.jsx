import './MinimumApplesView.css'

const WIDTH = 320
const HEIGHT = 260
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 + 4 }
const RADIUS = 92

function layout(n) {
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: CENTER.x + RADIUS * Math.cos(angle), y: CENTER.y + RADIUS * Math.sin(angle) }
  })
}

function cityRole(city, step) {
  if (city === step.u) return 'pick'
  if (city === step.j) return 'candidate'
  if (step.start === city) return 'start'
  if (step.settled?.[city]) return 'settled'
  return 'open'
}

export default function MinimumApplesView({ run, step }) {
  const n = run.input.n
  const points = layout(n)
  const dist = step.dist ?? []
  const edgeKey = step.edge ? `${step.edge.from}-${step.edge.to}` : null
  return (
    <div className="mc-view">
      <svg className="mc-graph" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img"
        aria-label={`Road graph with ${n} cities; start city ${step.start >= 0 ? step.start : 'none'}`}>
        {run.input.roads.map(([a, b, w]) => {
          const hot = edgeKey && (edgeKey === `${a}-${b}` || edgeKey === `${b}-${a}`)
          const improved = hot && step.edge.improved
          return (
            <g key={`${a}-${b}`} className={hot ? 'mc-edge mc-edge--hot' : 'mc-edge'} data-improved={improved ? 'yes' : undefined}>
              <line x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} />
              <text x={(points[a].x + points[b].x) / 2} y={(points[a].y + points[b].y) / 2 - 4}>{w}</text>
            </g>
          )
        })}
        {points.map((p, city) => {
          const role = cityRole(city, step)
          return (
            <g key={city} className={`mc-city mc-city--${role}`}>
              <circle cx={p.x} cy={p.y} r={17} />
              <text className="mc-city__id" x={p.x} y={p.y + 5}>{city}</text>
              <text className="mc-city__price" x={p.x} y={p.y + 31}>
                {`apple ${run.input.apple_cost[city]}`}
              </text>
              {dist.length > 0 && <text className="mc-city__dist" x={p.x} y={p.y - 24}>
                {`d=${dist[city] === null ? 'inf' : dist[city]}`}
              </text>}
            </g>
          )
        })}
      </svg>
      <p className="mc-legend">
        <span className="mc-chip mc-chip--start">start</span>
        <span className="mc-chip mc-chip--pick">picked</span>
        <span className="mc-chip mc-chip--settled">settled</span>
        <span className="mc-chip mc-chip--candidate">buy here</span>
        <span>Return roads cost k = {run.input.k} times the normal cost.</span>
      </p>
      <table className="mc-table" aria-label="Costs by start city">
        <thead><tr><th scope="col">Start</th><th scope="col">Best total</th></tr></thead>
        <tbody>
          {run.result.map((value, city) => (
            <tr key={city} className={step.answer.length > city ? 'mc-table__done' : undefined}>
              <th scope="row">{city}</th>
              <td>{step.answer.length > city ? value : (city === step.start ? (step.best ?? '...') : '...')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
