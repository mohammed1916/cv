import './SpacedSumView.css'

// Draws nums as a row of cells. Cells on the current query's stride are outlined; visited cells are filled.
export default function SpacedSumView({ run, step }) {
  const { nums, queries } = run.input
  const visited = new Set(step.visited || [])
  const current = step.index
  const activeQuery = step.qi >= 0 && step.qi < queries.length ? queries[step.qi] : null
  return (
    <div className="spaced-sum">
      <div className="spaced-sum__query" aria-live="polite">
        {activeQuery
          ? `Query ${step.qi + 1} of ${queries.length}: start ${activeQuery[0]}, step ${activeQuery[1]}`
          : step.phase === 'done' ? 'All queries answered' : 'Waiting for the first query'}
      </div>
      <div className="spaced-sum__row" role="list" aria-label="nums array">
        {nums.map((value, i) => {
          const onStride = activeQuery && i >= activeQuery[0] && (i - activeQuery[0]) % activeQuery[1] === 0
          const cls = i === current ? 'is-current' : visited.has(i) ? 'is-visited' : onStride ? 'is-target' : ''
          return (
            <div role="listitem" key={i} className={`spaced-sum__cell ${cls}`}>
              <span className="spaced-sum__index">{i}</span>
              <span className="spaced-sum__value">{value}</span>
              {cls === 'is-visited' && <span className="spaced-sum__mark">added</span>}
              {cls === 'is-current' && <span className="spaced-sum__mark">index</span>}
            </div>
          )
        })}
      </div>
      <p className="spaced-sum__legend">Dashed cells lie on the stride from start; filled cells have been added to total.</p>
      <dl className="spaced-sum__stats">
        <div><dt>total</dt><dd>{step.total ?? 0}</dd></div>
        <div><dt>index</dt><dd>{current >= 0 ? current : '-'}</dd></div>
      </dl>
      <ol className="spaced-sum__answers" aria-label="Answers so far">
        {queries.map((q, qi) => (
          <li key={qi} className={step.answers && qi < step.answers.length ? 'is-done' : ''}>
            [{q[0]}, {q[1]}] → {step.answers && qi < step.answers.length ? step.answers[qi] : '…'}
          </li>
        ))}
      </ol>
    </div>
  )
}
