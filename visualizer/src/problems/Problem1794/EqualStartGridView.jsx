import './EqualStartGridView.css'

// Rows are starts in s, columns are starts in t. Matching letters are filled; cells on the best gap diagonals are outlined.
export default function EqualStartGridView({ run, step }) {
  const { s, t } = run.input
  const rows = [...s]
  const cols = [...t]
  const gapOf = (i, j) => Math.abs(i - j)
  return (
    <div className="gap-grid">
      <div className="gap-grid__status" aria-live="polite">
        {step.i >= 0 ? `Testing s[${step.i}] = ${s[step.i]} against t[${step.j}] = ${t[step.j]}` : step.phase === 'done' ? 'Scan finished' : 'Grid of start pairs'}
      </div>
      <div className="gap-grid__scroll">
        <table className="gap-grid__table" aria-label="Start pairs of s and t">
          <thead>
            <tr>
              <th scope="col" aria-label="corner" />
              {cols.map((c, j) => <th scope="col" key={j} className={step.j === j ? 'is-col' : ''}>t{j}<span className="gap-grid__letter">{c}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th scope="row" className={step.i === i ? 'is-row' : ''}>s{i}<span className="gap-grid__letter">{r}</span></th>
                {cols.map((c, j) => {
                  const match = r === c
                  const onBest = match && step.best !== null && gapOf(i, j) === step.best
                  const current = i === step.i && j === step.j
                  const cls = [match ? 'is-match' : '', onBest ? 'is-best' : '', current ? 'is-current' : ''].join(' ')
                  return <td key={j} className={cls} aria-label={`s${i} t${j} ${match ? 'match, gap ' + gapOf(i, j) : 'no match'}`}>{match ? gapOf(i, j) : ''}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gap-grid__legend">Filled cells are letter matches and show their gap |i - j|. Dark cells have the best gap so far. The outlined cell is being tested now.</p>
      <dl className="gap-grid__stats">
        <div><dt>best gap</dt><dd>{step.best ?? 'none'}</dd></div>
        <div><dt>count</dt><dd>{step.count}</dd></div>
      </dl>
    </div>
  )
}
