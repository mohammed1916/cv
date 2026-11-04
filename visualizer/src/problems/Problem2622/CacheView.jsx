import './CacheView.css'

// The stored entries with their expiry times. An entry is alive only while its expiry is later than the current time.
export default function CacheView({ view }) {
  const time = view.time
  const ops = view.rows
  return <section className="cache-view" aria-label="Cache state">
    <p className="cache-view__clock">{time >= 0 ? <>Current time <strong>{time}</strong></> : 'Operations run in time order.'}</p>
    <ol className="cache-view__ops" role="list">
      {ops.map((row, index) => <li key={index} className={`cache-view__op${index === view.focus ? ' cache-view__op--current' : ''}`}>{row}</li>)}
    </ol>
    <table className="cache-view__table">
      <caption>Stored keys</caption>
      <thead><tr><th scope="col">Key</th><th scope="col">Value</th><th scope="col">Expires at</th><th scope="col">At this time</th></tr></thead>
      <tbody>
        {view.store.length === 0 && <tr><td colSpan={4}>Nothing stored yet.</td></tr>}
        {view.store.map(entry => {
          const alive = time < 0 ? null : entry.expires > time
          return <tr key={entry.key} className={alive === false ? 'cache-view__expired' : undefined}>
            <td>{entry.key}</td><td>{entry.value}</td><td>{entry.expires}</td>
            <td>{alive === null ? '-' : alive ? 'alive' : 'expired'}</td>
          </tr>
        })}
      </tbody>
    </table>
    <p className="cache-view__note">{`Answers so far: ${JSON.stringify(view.results)}`}</p>
  </section>
}
