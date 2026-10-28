// Key-to-count table for frequency problems. `entries` is [[key, count], ...]; `active` marks the key the current step touches.
export default function FrequencyCountTable({ title = 'Counts', entries = [], active = null, emptyText = 'Nothing counted yet.' }) {
  return <section className="frequency-count-table" aria-label={title}>
    <h3>{title}</h3>
    {entries.length === 0 ? <p><em>{emptyText}</em></p> : <table>
      <thead><tr><th scope="col">Key</th><th scope="col">Count</th></tr></thead>
      <tbody>{entries.map(([key, count]) => {
        const text = String(key)
        const current = active !== null && text === String(active)
        return <tr key={text} data-key={text} data-role={current ? 'current' : undefined}>
          <th scope="row">{current ? <strong>{text}</strong> : text}</th><td>{count}</td>
        </tr>
      })}</tbody>
    </table>}
  </section>
}
