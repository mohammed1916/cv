import './MemoView.css'

// The cache as key to value rows. Each call is marked hit (answered from the cache) or miss (fn runs).
export default function MemoView({ view }) {
  const outcome = view.focus >= 0 ? view.outcomes?.[view.focus] : null
  return <section className="memo-view" aria-label="Memoize cache">
    <ol className="memo-view__calls" role="list">
      {view.calls.map((args, index) => <li key={index} className={`memo-view__call${index === view.focus ? ' memo-view__call--current' : ''}`}>
        <code>{`fn(${args.join(', ')})`}</code>
      </li>)}
    </ol>
    <table className="memo-view__table">
      <caption>Cache, keyed by the argument list</caption>
      <thead><tr><th scope="col">Key</th><th scope="col">Stored value</th></tr></thead>
      <tbody>
        {view.entries.length === 0 && <tr><td colSpan={2}>Empty</td></tr>}
        {view.entries.map(entry => <tr key={entry.key}><td><code>{entry.key}</code></td><td>{entry.value}</td></tr>)}
      </tbody>
    </table>
    <p className="memo-view__note">{`fn has run ${view.underlying} time${view.underlying === 1 ? '' : 's'}.${outcome ? ` This call was a ${outcome}.` : ''}`}</p>
  </section>
}
