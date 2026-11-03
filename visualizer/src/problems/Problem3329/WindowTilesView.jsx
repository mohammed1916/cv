import './WindowTilesView.css'

// Tiles show the string; the window [left, right] is the run whose counts all stay below k.
export default function WindowTilesView({ run, step }) {
  if (!run || !step) return <section className="wt-view"><p>Press Play to slide the window across the string.</p></section>

  const { s, k } = run
  const letters = [...new Set(s)].sort()
  const inWindow = i => step.right >= 0 && i >= step.left && i <= step.right
  const visibleRight = step.right
  const counts = step.counts

  return (
    <section className="wt-view" aria-label="Sliding window of letter counts">
      <ol className="wt-view__tiles" aria-label="String characters">
        {[...s].map((ch, i) => (
          <li key={i}
            className={[
              'wt-view__tile',
              inWindow(i) ? 'wt-view__tile--window' : 'wt-view__tile--outside',
              i === visibleRight ? 'wt-view__tile--right' : '',
              step.leaving && i === step.left - 1 ? 'wt-view__tile--leaving' : '',
            ].join(' ')}>
            <span className="wt-view__char">{ch}</span>
            <span className="wt-view__index">{i}</span>
          </li>
        ))}
      </ol>
      <table className="wt-view__counts">
        <caption>Counts inside the window (k = {k})</caption>
        <thead><tr><th scope="col">Letter</th>{letters.map(ch => <th scope="col" key={ch}>{ch}</th>)}</tr></thead>
        <tbody><tr><th scope="row">count</th>{letters.map(ch => (
          <td key={ch} className={(counts[ch] || 0) >= k ? 'wt-view__hot' : ''}>{counts[ch] || 0}</td>
        ))}</tr></tbody>
      </table>
      <dl className="wt-view__stats">
        <div><dt>Window</dt><dd>{step.right >= 0 ? `[${step.left}, ${step.right}]` : 'none'}</dd></div>
        <div><dt>Bad so far</dt><dd>{step.bad}</dd></div>
        <div><dt>Total</dt><dd>{step.total}</dd></div>
        <div><dt>Answer</dt><dd>{step.done ? step.result : 'pending'}</dd></div>
      </dl>
    </section>
  )
}
