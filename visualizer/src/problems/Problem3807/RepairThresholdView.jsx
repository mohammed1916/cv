import './RepairThresholdView.css'

const CX = 160
const CY = 120
const R = 92

export default function RepairThresholdView({ run, step }) {
  if (!run || !step) return <p className="rt-empty">Press Play to search for the smallest repair threshold.</p>
  const { n, edges } = run.input
  const pos = Array.from({ length: n }, (_, v) => {
    const a = -Math.PI / 2 + (2 * Math.PI * v) / n
    return [CX + R * Math.cos(a), CY + R * Math.sin(a)]
  })
  const t = step.threshold
  const repaired = edge => t !== null && edge[2] <= t
  return (
    <section className="rt" aria-label="Repaired edges and candidate thresholds">
      <svg viewBox="0 0 320 240" role="img" aria-label="Graph with repaired and damaged edges">
        {edges.map(([u, v, c]) => {
          const [x1, y1] = pos[u]
          const [x2, y2] = pos[v]
          return (
            <g key={`${u}-${v}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={repaired([u, v, c]) ? 'rt-edge rt-edge--repaired' : 'rt-edge rt-edge--damaged'} />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} className="rt-cost">{c}</text>
            </g>
          )
        })}
        {pos.map(([x, y], v) => (
          <g key={v}>
            <circle cx={x} cy={y} r="17" className={`rt-node${v === n - 1 ? ' rt-node--target' : ''}`} />
            <text x={x} y={y + 4} className="rt-label">{v}</text>
            <text x={x} y={y + 31} className="rt-hops">{step.dist[v] === null || step.dist[v] === -1 ? '' : `${step.dist[v]} hop${step.dist[v] === 1 ? '' : 's'}`}</text>
          </g>
        ))}
      </svg>
      <ol className="rt-candidates" aria-label="Candidate thresholds">
        {step.candidates.map((c, i) => (
          <li key={i} className={[
            i === step.mid ? 'rt-cand--mid' : '',
            step.lo !== null && i === step.lo ? 'rt-cand--lo' : '',
            step.hi !== null && i === step.hi ? 'rt-cand--hi' : '',
            step.lo !== null && step.hi !== null && (i < step.lo || i > step.hi) ? 'rt-cand--out' : '',
          ].join(' ').trim()}>{c}</li>
        ))}
      </ol>
      <p className="rt-legend">Solid edges are repaired at threshold {t === null ? '-' : t}; dashed edges are still damaged. Labels show hop counts from node 0.</p>
      <p className="rt-message">{step.message}</p>
    </section>
  )
}
