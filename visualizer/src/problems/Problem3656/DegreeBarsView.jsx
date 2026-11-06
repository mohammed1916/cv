import './DegreeBarsView.css'

// Degrees are bars sorted from largest to smallest. For the current k, the top k bars are
// filled darker, and the rest are grey because they contribute only min(degree, k) each.
export default function DegreeBarsView({ run, step }) {
  const sorted = step.sorted || [...run.input].sort((a, b) => b - a)
  const k = step.k
  const max = Math.max(1, ...sorted)
  return <div className="degree-bars" style={{ '--accent': 'var(--error)' }}>
    <ol className="degree-bars__bars" aria-label="Degrees sorted from largest to smallest">
      {sorted.map((d, i) => <li key={i} className="degree-bars__bar" data-top={k !== null && i < k ? 'yes' : undefined} data-rest={k !== null && i >= k ? 'yes' : undefined}>
        <span>{d}</span>
        <div className="degree-bars__fill" style={{ height: `${Math.max(4, (d / max) * 120)}px` }} />
      </li>)}
    </ol>
    {k !== null && <dl className="degree-bars__compare">
      <div><dt>Top {k} sum</dt><dd><strong>{step.left}</strong></dd></div>
      <div><dt>Bound</dt><dd><strong>{step.right}</strong></dd></div>
    </dl>}
    <p>{step.message}</p>
  </div>
}
