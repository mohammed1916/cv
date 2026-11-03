import './CoinRowView.css'

// Shows the best table as a row of sums. The current sum is outlined, and the sum
// it extends by one prime is shaded.
export default function CoinRowView({ run, step }) {
  const best = step.best
  return <div className="coin-row" style={{ '--accent': '#b45309' }}>
    <div>
      <strong>Prime coins</strong>
      <ul className="coin-row__chips" aria-label="Prime coins">
        {run.primes.map(p => <li key={p} data-active={step.p === p ? 'yes' : undefined}>{p}</li>)}
      </ul>
    </div>
    <ol className="coin-row__cells" aria-label="Fewest primes for each sum">
      {best.map((value, x) => {
        let state = value === null ? 'empty' : 'filled'
        if (x === step.x) state = 'current'
        if (step.from !== null && x === step.from) state = 'source'
        return <li key={x} data-state={state}>
          <span>{x}</span>
          <strong>{value === null ? '—' : value}</strong>
        </li>
      })}
    </ol>
    <p>{step.p !== null && step.p !== undefined ? `Trying prime ${step.p} for sum ${step.x}.` : `Current sum: ${step.x}.`}</p>
    {step.result !== undefined && <p>Result: {step.result}</p>}
  </div>
}
