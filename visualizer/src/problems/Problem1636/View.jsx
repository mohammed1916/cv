// Count table (value, count) in the final order, and the expanded output so far.
export default function View({ run, step }) {
  const counts = step.snapshot.counts ?? {}
  const order = step.snapshot.order ?? [...new Set(run.input)]
  const out = step.snapshot.out ?? []
  return <div className="frequency-sort-view">
    <table aria-label="Value counts">
      <thead><tr><th>Value</th><th>Count</th></tr></thead>
      <tbody>{order.map(v => <tr key={v} className={step.phase === 'expand' && out.includes(v) ? 'is-done' : ''}>
        <th>{v}</th><td>{counts[v] ?? 0}</td>
      </tr>)}</tbody>
    </table>
    <ol aria-label="Output so far" className="frequency-sort-view__out">
      {out.map((v, i) => <li key={i}>{v}</li>)}
    </ol>
    <p>{step.message}</p>
  </div>
}
