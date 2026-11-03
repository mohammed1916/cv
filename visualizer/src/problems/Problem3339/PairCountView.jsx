import './PairCountView.css'

// Each row is a number of good pairs so far; the two columns split the ways by the last entry's parity.
export default function PairCountView({ run, step }) {
  if (!run || !step) return <section className="pc-view"><p>Press Play to build the count one entry at a time.</p></section>

  const { n, m, k, evens, odds } = run
  const rows = Array.from({ length: k + 1 }, (_, c) => c)
  const done = step.phase === 'done'

  return (
    <section className="pc-view" aria-label="Good pair count table">
      <div className="pc-view__legend">
        <span><strong>{evens}</strong> even value{evens === 1 ? '' : 's'} (2, 4, ...)</span>
        <span><strong>{odds}</strong> odd value{odds === 1 ? '' : 's'}</span>
        <span>A pair is good only when both entries are even.</span>
      </div>
      <ol className="pc-view__length" aria-label="Array positions">
        {Array.from({ length: n }, (_, i) => (
          <li key={i} className={i < step.length ? 'pc-view__slot pc-view__slot--filled' : 'pc-view__slot'}>{i + 1}</li>
        ))}
      </ol>
      <table className="pc-view__table">
        <caption>Ways for the current length {step.length || 0} (k = {k} good pairs)</caption>
        <thead>
          <tr><th scope="col">Good pairs</th><th scope="col">Ends on even</th><th scope="col">Ends on odd</th></tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c} className={c === k ? 'pc-view__target' : ''}>
              <th scope="row">{c}</th>
              <td>{step.ev[c] ?? 0}</td>
              <td>{step.od[c] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pc-view__answer" aria-live="polite">
        {done ? `Answer for n = ${n}, k = ${k}: ${step.result}` : `Target row: k = ${k}. Sum of its two cells is the answer for length ${n}.`}
      </p>
      {n && m && <span className="pc-view__hint">m = {m} values from 1 to {m}</span>}
    </section>
  )
}
