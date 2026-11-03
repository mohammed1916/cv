import './CoverageRowView.css'

export default function CoverageRowView({ run, step }) {
  const { values, tokens } = run.input
  return (
    <section className="coverage-row" aria-label="Covered indices">
      <div className="coverage-row__cells" role="list" aria-label="Indices">
        {values.map((value, i) => {
          const token = tokens[i] === '1'
          const active = step.index === i
          return <div key={i} role="listitem" className={`coverage-row__cell${active ? ' coverage-row__cell--active' : ''}${token ? ' coverage-row__cell--token' : ''}`}>
            <span className="coverage-row__index">{i}</span>
            <span className="coverage-row__value">{value}</span>
            <span className="coverage-row__mark" aria-label={token ? 'token' : 'no token'}>{token ? 'token' : '-'}</span>
            {active && step.choice === 'token' && <span className="coverage-row__arrow">{i >= 1 ? `${i} or ${i - 1}` : `stays at ${i}`}</span>}
          </div>
        })}
      </div>
      <dl className="coverage-row__state" aria-label="Best totals after this index">
        <dt>Last slot covered by its token</dt><dd>{step.covered === null ? 'none' : step.covered}</dd>
        <dt>Last slot left open</dt><dd>{step.open === null ? 'none' : step.open}</dd>
      </dl>
      <p className="coverage-row__message">{step.message}</p>
    </section>
  )
}
