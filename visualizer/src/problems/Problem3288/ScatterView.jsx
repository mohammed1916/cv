import "./ScatterView.css";

const SIZE = 300
const PAD = 26
const MAX = 100
const sx = x => PAD + (x / MAX) * (SIZE - 2 * PAD)
const sy = y => SIZE - PAD - (y / MAX) * (SIZE - 2 * PAD)

export default function ScatterView({ run, step }) {
  const { coordinates, k } = run.input
  const memo = new Map(step.memo.map(e => [e.index, e]))
  const [px, py] = coordinates[step.index >= 0 ? step.index : k]
  const showRegion = step.index >= 0 && (step.phase === "visit" || step.phase === "store" || step.phase === "reuse")
  const rising = step.direction === "rising"
  return (
    <div className="sv-view">
      <svg className="sv-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Points on the plane">
        <line className="sv-axis" x1={PAD} y1={SIZE - PAD} x2={SIZE - PAD} y2={SIZE - PAD} />
        <line className="sv-axis" x1={PAD} y1={PAD} x2={PAD} y2={SIZE - PAD} />
        {showRegion && (rising
          ? <rect className="sv-region" x={sx(px)} y={PAD} width={SIZE - PAD - sx(px)} height={sy(py) - PAD} />
          : <rect className="sv-region" x={PAD} y={sy(py)} width={sx(px) - PAD} height={SIZE - PAD - sy(py)} />)}
        {coordinates.map(([x, y], i) => {
          const cls = `sv-point ${i === k ? "is-required" : ""} ${i === step.index ? "is-active" : ""}`
          const row = memo.get(i)
          return <g key={i}>
            <circle className={cls} cx={sx(x)} cy={sy(y)} r={i === step.index ? 8 : 6} />
            <text className="sv-label" x={sx(x) + 9} y={sy(y) - 6}>{i}{row ? ` R${row.rising ?? "-"} F${row.falling ?? "-"}` : ""}</text>
          </g>
        })}
      </svg>
      <ul className="sv-list" aria-label="Chain lengths stored so far">
        {[...memo.values()].map(e => <li key={e.index}>point {e.index}: rising {e.rising ?? "-"}, falling {e.falling ?? "-"}</li>)}
      </ul>
      <p className="sv-note">Filled point is the required point k. The shaded region is where the current chain can continue: {rising ? "larger in both coordinates" : "smaller in both coordinates"}.</p>
    </div>
  )
}
