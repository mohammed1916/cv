import './PlaceSplitView.css'

export default function PlaceSplitView({ run, step }) {
  const { d, low, high } = run.input
  const boundLabel = step.bound === 'high' ? `count(${high}, ${d})` : step.bound === 'low-1' ? `count(${low - 1}, ${d})` : null
  const current = step.p
  return (
    <figure className="psv" aria-label="Place-by-place split of the bounds">
      <p className="psv__ask">Count digit <b>{d}</b> from <b>{low}</b> to <b>{high}</b>, as count({high}) minus count({low - 1}).</p>
      <div className="psv__bounds">
        <div className={`psv__bound${step.bound === 'high' ? ' psv__bound--on' : ''}`}>
          <span>upper</span>
          <strong>{high}</strong>
          <em>{step.upper !== null ? `= ${step.upper}` : 'pending'}</em>
        </div>
        <div className={`psv__bound${step.bound === 'low-1' ? ' psv__bound--on' : ''}`}>
          <span>lower (low − 1)</span>
          <strong>{low - 1}</strong>
          <em>{step.lower !== null ? `= ${step.lower}` : 'pending'}</em>
        </div>
      </div>
      {boundLabel && (
        <table className="psv__table">
          <caption>{boundLabel}, one place at a time</caption>
          <thead>
            <tr><th>Place p</th><th>Prefix</th><th>Digit</th><th>Suffix</th><th>Adds</th><th>Running</th></tr>
          </thead>
          <tbody>
            {step.rows.map(row => (
              <tr key={row.p} className={row.p === current ? 'psv__row--now' : ''}>
                <td>{row.p}</td>
                <td>{row.high}</td>
                <td className="psv__digit">{row.cur}</td>
                <td>{row.low}</td>
                <td>+{row.added}</td>
                <td>{step.rows.filter(r => r.p <= row.p).reduce((s, r) => s + r.added, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="psv__status" role="status">
        {step.message}
        {step.phase === 'done' ? ` Answer: ${step.result}.` : ''}
      </p>
      <p className="psv__rule">Digit {d} at place p: the prefix above it sets full blocks; the digit itself decides whether the current block adds p, low + 1, or nothing.</p>
    </figure>
  )
}
