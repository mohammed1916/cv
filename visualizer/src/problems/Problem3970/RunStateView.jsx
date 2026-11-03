import './RunStateView.css'

export default function RunStateView({ run, step }) {
  const { labels, k, edges } = run.input
  const n = labels.length
  const cx = i => 40 + i * (520 / Math.max(1, n - 1))
  const cy = 46
  return (
    <section className="run-state" aria-label="Limited run states">
      <svg viewBox="0 0 600 110" role="img" aria-label="Graph with vertices and directed edges">
        <defs>
          <marker id="run-state-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="run-state__arrow" />
          </marker>
        </defs>
        {edges.map(([u, v, w], i) => {
          const x1 = cx(u), x2 = cx(v)
          const bend = u < v ? -26 : 26
          return <g key={i}>
            <path d={`M${x1},${cy} Q${(x1 + x2) / 2},${cy + bend} ${x2},${cy}`} className={`run-state__edge${step.current && step.current.w === v && step.current.v === u ? ' run-state__edge--hot' : ''}`} markerEnd="url(#run-state-arrow)" />
            <text x={(x1 + x2) / 2} y={cy + bend / 2 - 4} className="run-state__weight">{w}</text>
          </g>
        })}
        {labels.split('').map((ch, i) => (
          <g key={i} className={`run-state__vertex${step.current && step.current.v === i ? ' run-state__vertex--current' : ''}`}>
            <circle cx={cx(i)} cy={cy} r="16" />
            <text x={cx(i)} y={cy + 5} textAnchor="middle">{`${i}:${ch}`}</text>
          </g>
        ))}
      </svg>
      <table className="run-state__table" aria-label="Distance by node and run length">
        <thead><tr><th>Node</th>{Array.from({ length: k }, (_, r) => <th key={r}>run {r + 1}</th>)}</tr></thead>
        <tbody>
          {labels.split('').map((ch, v) => (
            <tr key={v}>
              <th>{`${v} (${ch})`}</th>
              {Array.from({ length: k }, (_, r) => {
                const d = step.table[v][r]
                const current = step.current && step.current.v === v && step.current.run === r + 1
                const finished = step.done[v][r]
                return <td key={r} className={`${current ? 'run-state__cell--current' : ''} ${finished ? 'run-state__cell--done' : ''}`}>{d === null ? '-' : d}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="run-state__message">{step.message}</p>
    </section>
  )
}
