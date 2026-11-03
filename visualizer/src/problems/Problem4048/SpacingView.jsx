import './SpacingView.css'

// Shows the array with the value under inspection highlighted, then a table of positions and verdicts.
export default function SpacingView({ run, step }) {
  const nums = run.input
  const current = step.value
  const gapText = idx => (idx.length < 2 ? '' : idx.slice(1).map((p, t) => p - idx[t]).join(', '))

  return (
    <section className="spc" aria-label="Equally spaced occurrences">
      <div className="spc-row" role="list" aria-label="Array values">
        {nums.map((value, i) => {
          const hot = current !== null && value === current
          return (
            <div
              key={i}
              role="listitem"
              className={`spc-cell${hot ? ' spc-cell--hot' : ''}${i === step.at ? ' spc-cell--now' : ''}`}
            >
              <span className="spc-index">{i}</span>
              <span className="spc-value">{value}</span>
            </div>
          )
        })}
      </div>

      <table className="spc-table">
        <caption>Positions per value</caption>
        <thead>
          <tr><th scope="col">Value</th><th scope="col">Indices</th><th scope="col">Gaps</th><th scope="col">Verdict</th></tr>
        </thead>
        <tbody>
          {step.positions.map(([value, idx]) => {
            const isCurrent = value === current
            const verdict = isCurrent ? step.verdict : (idx.length === 3 && gapText(idx).split(', ')[0] === gapText(idx).split(', ')[1] ? 'counted' : '')
            return (
              <tr key={value} className={isCurrent ? 'spc-current' : ''}>
                <td>{value}</td>
                <td>{idx.join(', ')}</td>
                <td>{gapText(idx) || '-'}</td>
                <td>{verdict || 'pending'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <output className="spc-count" aria-label="Count so far">Count so far: {step.count}</output>
    </section>
  )
}
