import './BudgetRowView.css'

export default function BudgetRowView({ run, step }) {
  const { factors, prices, budget } = run.input
  const maxValue = Math.max(1, ...step.row)
  return (
    <section className="budget-row" aria-label="Types and budget row">
      <ul className="budget-row__types">
        {factors.map((f, i) => (
          <li key={i} className={i === step.type ? 'is-current' : ''}>
            <strong>Type {i}</strong>
            <span>factor {f}, price {prices[i]}</span>
            <span>grants {step.grants[i]}</span>
          </li>
        ))}
      </ul>
      <ol className="budget-row__cells" aria-label="Best total for each budget">
        {step.row.map((v, b) => (
          <li key={b} className={b === budget ? 'is-target' : ''}>
            <span>{b}</span>
            <i style={{ height: `${(v / maxValue) * 56}px` }} />
            <strong>{v}</strong>
          </li>
        ))}
      </ol>
      <p role="status">{step.message}</p>
    </section>
  )
}
