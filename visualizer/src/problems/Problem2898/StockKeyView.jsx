import './StockKeyView.css'

export default function StockKeyView({ run, step }) {
  const { prices } = run.input
  return (
    <div className="stock-key-view">
      <p className="stock-rule">Key = price minus day index. Days that share a key form one linear run.</p>
      <ol className="stock-strip" aria-label="Days with keys">
        {prices.map((price, i) => {
          const classes = ['stock-day']
          if (i === step.index) classes.push('is-current')
          else if (step.index >= 0 && i < step.index) classes.push('is-seen')
          if (step.index === i && step.key !== null && step.key === price - i) classes.push('is-key')
          return (
            <li key={i} className={classes.join(' ')}>
              <span className="stock-day-index">day {i}</span>
              <strong className="stock-day-price">{price}</strong>
              <span className="stock-day-key">key {price - i}</span>
            </li>
          )
        })}
      </ol>
      <table className="stock-groups">
        <caption>Group totals</caption>
        <thead><tr><th scope="col">Key</th><th scope="col">Total</th></tr></thead>
        <tbody>
          {step.sums.length === 0 && <tr><td colSpan={2}>No groups yet</td></tr>}
          {step.sums.map(group => (
            <tr key={group.key} className={group.key === step.bestKey ? 'is-best' : ''}>
              <th scope="row">{group.key}{group.key === step.bestKey ? ' (best)' : ''}</th>
              <td>{group.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output className="stock-best" aria-label="Best total">Best so far: {step.best}</output>
    </div>
  )
}
