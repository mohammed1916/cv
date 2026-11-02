import './BikePlaneView.css'

const CELL = 28
const PAD = 16

export default function BikePlaneView({ run, step }) {
  const { workers, bikes } = run.input
  const maxC = Math.max(4, ...workers.flat(), ...bikes.flat())
  const size = PAD * 2 + (maxC + 1) * CELL
  const at = ([x, y]) => [PAD + x * CELL, PAD + (maxC - y) * CELL]
  const cursor = step.cursor >= 0 ? step.sorted[step.cursor] : null
  const assigned = step.answer.map((bike, worker) => (bike >= 0 ? { worker, bike } : null)).filter(Boolean)
  const ticks = Array.from({ length: maxC + 1 }, (_, i) => i)
  return (
    <figure className="bpv" aria-label="Workers and bikes on a grid with Manhattan distances">
      <svg className="bpv__plane" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Plane with workers and bikes">
        {ticks.map(t => (
          <g key={t} className="bpv__grid">
            <line x1={PAD + t * CELL} y1={PAD} x2={PAD + t * CELL} y2={size - PAD} />
            <line x1={PAD} y1={PAD + t * CELL} x2={size - PAD} y2={PAD + t * CELL} />
          </g>
        ))}
        {assigned.map(({ worker, bike }) => {
          const [x1, y1] = at(workers[worker]); const [x2, y2] = at(bikes[bike])
          return <line key={`a${worker}`} className="bpv__assigned" x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        {cursor && (() => {
          const [x1, y1] = at(workers[cursor.w]); const [x2, y2] = at(bikes[cursor.b])
          return <line className="bpv__current" x1={x1} y1={y1} x2={x2} y2={y2} />
        })()}
        {workers.map((p, i) => {
          const [x, y] = at(p)
          return <g key={`w${i}`} className={`bpv__worker${step.answer[i] >= 0 ? ' bpv__worker--done' : ''}${cursor && cursor.w === i ? ' bpv__worker--now' : ''}`}>
            <circle cx={x} cy={y} r="9" /><text x={x} y={y + 4} textAnchor="middle">W{i}</text>
          </g>
        })}
        {bikes.map((p, i) => {
          const [x, y] = at(p)
          const used = step.bikeUsed[i]
          return <g key={`b${i}`} className={`bpv__bike${used ? ' bpv__bike--used' : ''}${cursor && cursor.b === i ? ' bpv__bike--now' : ''}`}>
            <rect x={x - 8} y={y - 8} width="16" height="16" /><text x={x} y={y - 12} textAnchor="middle">B{i}</text>
          </g>
        })}
      </svg>
      <table className="bpv__table">
        <caption>Pairs in sorted order</caption>
        <thead><tr><th>#</th><th>Worker</th><th>Bike</th><th>Distance</th><th>Status</th></tr></thead>
        <tbody>
          {step.sorted.map((pair, index) => (
            <tr key={`${pair.w}-${pair.b}`} className={index === step.cursor ? 'bpv__row--now' : ''}>
              <td>{index + 1}</td><td>W{pair.w}</td><td>B{pair.b}</td><td>{pair.d}</td>
              <td>{step.status[index] === 'assigned' ? '✓ assigned' : step.status[index] === 'skipped' ? '✕ skipped' : '· pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="bpv__status" role="status">
        {assigned.length} of {workers.length} workers assigned. Dashed amber line: the pair being considered.
      </p>
    </figure>
  )
}
