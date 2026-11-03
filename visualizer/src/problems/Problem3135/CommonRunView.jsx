import './CommonRunView.css'

// Grid of matching runs: rows are s, columns are t. A diagonal climb marks a shared piece.
export default function CommonRunView({ run, step }) {
  const { s, t } = run.input
  const table = step.table
  return (
    <section className="common-run" aria-label="Matching run table">
      <p className="common-run__summary">Best shared run so far: <strong>{step.best}</strong></p>
      <div className="common-run__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">s down, t across</th>
              {[...t].map((letter, j) => <th key={j} scope="col">{letter}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...s].map((letter, i) => (
              <tr key={i}>
                <th scope="row">{letter}</th>
                {[...t].map((other, j) => {
                  const value = table[i + 1][j + 1]
                  const current = step.row === i + 1 && step.col === j + 1
                  const best = value > 0 && value === step.best
                  const cls = ['common-run__cell', letter === other ? 'is-same' : 'is-diff', current ? 'is-current' : '', best ? 'is-best' : ''].join(' ')
                  return <td key={j} className={cls}>{value}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="common-run__caption">
        {step.phase === 'done'
          ? `Operations = ${s.length} + ${t.length} - 2 × ${step.best}.`
          : 'Green cells have equal letters; the number counts how long the shared run ending there is.'}
      </p>
    </section>
  )
}
