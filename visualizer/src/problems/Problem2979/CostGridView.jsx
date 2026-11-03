import './CostGridView.css'

export default function CostGridView({ run, step }) {
  const { coins } = run.input
  const [a, b] = coins
  const limit = a * b
  const cells = Array.from({ length: limit + 1 }, (_, x) => x)
  const reach = step.reach ?? []
  const cols = Math.max(a, b) * 2
  return (
    <div className="cost-grid-view">
      <p className="cost-rule">Costs are laid out in rows of {cols}. Green costs can be paid with some number of {a}-coins and {b}-coins. Red costs cannot, and the last red cost below {limit} is the answer.</p>
      <div className="cost-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="img" aria-label={`Costs 0 to ${limit} marked payable or not`}>
        {cells.map(x => {
          const known = x < reach.length
          const classes = ['cost-cell']
          if (known && reach[x]) classes.push('is-payable')
          if (known && !reach[x] && x > 0) classes.push('is-gap')
          if (x === step.x && step.phase !== 'done') classes.push('is-current')
          if (step.phase === 'done' && x === step.largest) classes.push('is-answer')
          if (x === step.largest && step.phase !== 'done' && step.largest > 0) classes.push('is-answer')
          return <span key={x} className={classes.join(' ')} title={`cost ${x}`}>{x}</span>
        })}
      </div>
      <dl className="cost-facts">
        <div><dt>Coins</dt><dd>{a} and {b}</dd></div>
        <div><dt>Checking</dt><dd>{step.x >= 0 ? step.x : 'none'}</dd></div>
        <div><dt>Largest gap</dt><dd>{step.largest}</dd></div>
      </dl>
      <output className="cost-message" aria-label="Cost status">{step.message}</output>
    </div>
  )
}
