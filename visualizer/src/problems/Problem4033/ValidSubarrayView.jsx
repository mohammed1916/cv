import './ValidSubarrayView.css'

// Draws the array with the active query window, the running count table, and one chip per query.
export default function ValidSubarrayView({ run, step }) {
  const { nums, k, queries } = run.input
  const inWindow = i => step.query >= 0 && i >= step.l && i <= step.r
  const counts = step.counts ?? []

  return (
    <section className="vsk" aria-label="Valid K-Unique Subarrays query">
      <div className="vsk-row" role="list" aria-label="Array values">
        {nums.map((value, i) => (
          <div
            key={i}
            role="listitem"
            className={`vsk-cell${inWindow(i) ? ' vsk-cell--in' : ''}${i === step.at ? ' vsk-cell--now' : ''}`}
          >
            <span className="vsk-index">{i}</span>
            <span className="vsk-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="vsk-table">
        <h3>Counts in the current range</h3>
        {counts.length === 0 ? (
          <p className="vsk-muted">No values counted yet.</p>
        ) : (
          <ul>
            {counts.map(([value, count]) => (
              <li key={value} className={count % 2 ? 'vsk-odd' : 'vsk-even'}>
                value {value}: {count} ({count % 2 ? 'odd' : 'even'})
              </li>
            ))}
          </ul>
        )}
        <p>Target: exactly {k} distinct value{k === 1 ? '' : 's'}, all counts even.</p>
        {step.phase === 'check' || step.phase === 'record' ? (
          <p className={step.ok ? 'vsk-yes' : 'vsk-no'}>{step.ok ? 'Verdict: valid' : 'Verdict: not valid'}</p>
        ) : null}
      </div>

      <div className="vsk-answers" aria-label="Answers so far">
        {queries.map(([l, r], q) => {
          const answered = q < step.answers.length
          const state = answered ? (step.answers[q] ? 'yes' : 'no') : 'pending'
          return (
            <span key={q} className={`vsk-chip vsk-chip--${state}${q === step.query ? ' vsk-chip--now' : ''}`}>
              [{l}, {r}] {answered ? (step.answers[q] ? 'valid' : 'not valid') : 'pending'}
            </span>
          )
        })}
      </div>
    </section>
  )
}
