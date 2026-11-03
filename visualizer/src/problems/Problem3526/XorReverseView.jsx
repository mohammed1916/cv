import './XorReverseView.css'

// The array as tiles. The active range is shaded; a point query highlights the index being XORed into the running value; a reversal shows the pair being swapped.
export default function XorReverseView({ run, step }) {
  if (!run || !step) return <section className="xr-view"><p className="xr-empty">Press Play to run the queries in order.</p></section>
  const { nums, range, at, pairEnd, acc, results, query, queries } = step
  const [a, b] = range || [-1, -1]
  const inRange = i => range && i >= a && i <= b
  return (
    <section className="xr-view" aria-label="Array with range XOR and reversal queries">
      <div className="xr-array" aria-label="Current nums">
        {nums.map((v, i) => (
          <span key={i} className={`xr-cell${inRange(i) ? ' xr-cell--range' : ''}${i === at ? ' xr-cell--at' : ''}${pairEnd === i ? ' xr-cell--pair' : ''}`}>
            {v}
            <small>{i}</small>
          </span>
        ))}
      </div>
      {acc !== null && acc !== undefined && <p className="xr-acc">Running XOR: <strong>{acc}</strong></p>}
      <div className="xr-results" aria-label="XOR answers">
        <span className="xr-label">Answers</span>
        {results.length === 0 ? <span className="xr-none">none yet</span> : results.map((v, i) => <span key={i} className="xr-answer">{v}</span>)}
      </div>
      <ol className="xr-queue" aria-label="Queries">
        {queries.map((q, i) => (
          <li key={i} className={i === query ? 'xr-query xr-query--current' : i < query ? 'xr-query xr-query--done' : 'xr-query'}>[{q.join(', ')}]</li>
        ))}
      </ol>
      <p className="xr-summary">{step.message}</p>
    </section>
  )
}
