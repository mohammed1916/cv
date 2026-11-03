import './WaiverGraphView.css'

const CX = 160
const CY = 130
const R = 100

export default function WaiverGraphView({ run, step }) {
  if (!run || !step) return <p className="wg-empty">Press Play to search the two-layer state graph.</p>
  const { n, edges } = run.input
  const pos = Array.from({ length: n }, (_, v) => {
    const a = -Math.PI / 2 + (2 * Math.PI * v) / n
    return [CX + R * Math.cos(a), CY + R * Math.sin(a)]
  })
  const fmt = d => (d === null ? '∞' : String(d))
  return (
    <section className="wg" aria-label="Graph and cheapest costs with one edge waived">
      <svg viewBox="0 0 320 260" role="img" aria-label="Weighted graph">
        {edges.map(({ u, v, w }) => {
          const [x1, y1] = pos[u]
          const [x2, y2] = pos[v]
          return (
            <g key={`${u}-${v}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="wg-edge" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} className="wg-weight">{w}</text>
            </g>
          )
        })}
        {pos.map(([x, y], v) => (
          <g key={v}>
            <circle cx={x} cy={y} r="16" className={`wg-node${v === step.node ? ' wg-node--current' : ''}${v === n - 1 ? ' wg-node--target' : ''}`} />
            <text x={x} y={y + 4} className="wg-label">{v}</text>
          </g>
        ))}
      </svg>
      <table className="wg-table">
        <caption>Cheapest cost per state (node, waived?)</caption>
        <thead><tr><th scope="col">Node</th><th scope="col">No edge waived</th><th scope="col">One edge waived</th></tr></thead>
        <tbody>
          {step.dist.map((row, v) => (
            <tr key={v}>
              <th scope="row">{v}</th>
              {row.map((d, f) => (
                <td key={f} className={`${step.done[v][f] ? 'wg-done' : ''}${step.node === v && step.flag === f ? ' wg-focus' : ''}`}>{fmt(d)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="wg-message">{step.message}</p>
    </section>
  )
}
