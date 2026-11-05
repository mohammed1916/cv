import './DiffBarsView.css'

const W = 640
const H = 230
const BASE = 200
const TOP = 24

// Each pair's absolute difference as a dashed ghost bar, the current (capped or reduced) value as a solid bar,
// and the probed threshold t as a line: everything above t is what the operations must shave down.
export default function DiffBarsView({ diffs, capped, t, at, probing }) {
  const max = Math.max(1, ...diffs)
  const scale = (BASE - TOP) / max
  const slot = W / diffs.length
  const y = v => BASE - v * scale
  const current = capped ?? diffs
  return (
    <figure className="db-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Differences with the current threshold line">
        {t !== null && t !== undefined && t >= 0 && (
          <g>
            <line x1={0} x2={W} y1={y(t)} y2={y(t)} className={probing ? 'db-threshold db-threshold--probe' : 'db-threshold'} />
            <text x={W - 6} y={y(t) - 6} textAnchor="end" className="db-tag">t = {t}</text>
          </g>
        )}
        {diffs.map((d, i) => {
          const x = i * slot + 10
          const w = slot - 20
          const cur = current[i]
          const cls = i === at ? 'db-bar db-bar--at' : cur < d ? 'db-bar db-bar--reduced' : d > (t ?? Infinity) ? 'db-bar db-bar--above' : 'db-bar'
          return (
            <g key={i}>
              <rect x={x} y={y(d)} width={w} height={d * scale} className="db-ghost" />
              <rect x={x} y={y(cur)} width={w} height={Math.max(2, cur * scale)} className={cls} />
              <text x={x + w / 2} y={y(d) - 6} textAnchor="middle" className="db-tag">{cur < d ? `${d}→${cur}` : d}</text>
              <text x={x + w / 2} y={BASE + 16} textAnchor="middle" className="db-tag">|diff {i}|</text>
            </g>
          )
        })}
        <line x1={0} x2={W} y1={BASE} y2={BASE} className="db-floor" />
      </svg>
      <figcaption>Dashed outline: original difference. Solid bar: after the operations so far. Orange: above the threshold being tested.</figcaption>
    </figure>
  )
}
