import './SpreadGridView.css'

const CELL = 26

export default function SpreadGridView({ run, step }) {
  const { points, k, box } = step.box ? step : run
  const cols = box.x1 - box.x0 + 1
  const rows = box.y1 - box.y0 + 1
  const width = cols * CELL + 40
  const height = rows * CELL + 40
  const X = x => 20 + (x - box.x0) * CELL + CELL / 2
  const Y = y => 20 + (box.y1 - y) * CELL + CELL / 2
  const cellInfo = step.cell
  const day = step.mid ?? step.day
  const members = new Set(step.members ?? [])
  const cells = []
  for (let x = box.x0; x <= box.x1; x += 1) for (let y = box.y0; y <= box.y1; y += 1) cells.push([x, y])
  const hiMax = Math.max(step.high ?? 0, 1)
  return (
    <section className="spread-grid" aria-label="Spread grid visual">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Grid of ${cols} by ${rows} cells with ${points.length} variants`}>
        {cells.map(([x, y]) => {
          const inReach = cellInfo && day !== null && day !== undefined && Math.abs(x - cellInfo[0]) + Math.abs(y - cellInfo[1]) <= day
          return <rect key={`${x},${y}`} x={X(x) - CELL / 2} y={Y(y) - CELL / 2} width={CELL} height={CELL}
            className={`spread-grid__cell${inReach ? ' is-reach' : ''}${cellInfo && cellInfo[0] === x && cellInfo[1] === y ? ' is-probe' : ''}`} />
        })}
        {points.map(([px, py], i) => (
          <g key={i} className={`spread-grid__seed${members.has(i) ? ' is-in' : ''}`}>
            <circle cx={X(px)} cy={Y(py)} r={9} />
            <text x={X(px)} y={Y(py) + 3.5} textAnchor="middle">{i}</text>
          </g>
        ))}
        {cellInfo && <text className="spread-grid__probe-label" x={X(cellInfo[0])} y={Y(cellInfo[1]) - 16} textAnchor="middle">({cellInfo[0]},{cellInfo[1]})</text>}
      </svg>
      <dl className="spread-grid__facts">
        <div><dt>Day tested</dt><dd>{day ?? '-'}</dd></div>
        <div><dt>Variants at cell</dt><dd>{step.count ?? '-'} of {k} needed</dd></div>
        <div><dt>Range</dt><dd>{step.low} to {step.high}</dd></div>
      </dl>
      <div className="spread-grid__track" role="img" aria-label={`Search range ${step.low} to ${step.high}`}>
        <span className="spread-grid__span" style={{ left: `${(step.low / hiMax) * 100}%`, width: `${(Math.max(step.high - step.low, 0) / hiMax) * 100}%` }} />
        {step.mid !== null && step.mid !== undefined && <span className="spread-grid__mid" style={{ left: `${(step.mid / hiMax) * 100}%` }} />}
      </div>
    </section>
  )
}
