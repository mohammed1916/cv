import './CoinWaysView.css'

// A strip of amounts 0..n with the ways count under each one. The amount being extended is
// highlighted; below it, the three 4-coin cases read the strip at n, n - 4 and n - 8.
export default function CoinWaysView({ run, step }) {
  const n = run.input
  const amounts = Array.from({ length: n + 1 }, (_, k) => k)
  const readAt = new Set(step.fours.map(f => f.rest))
  return (
    <section className="coin-ways" aria-label="Ways to make each amount">
      <div className="coin-ways__strip" role="list" aria-label="Ways table">
        {amounts.map(k => {
          const cls = ['coin-ways__cell', k === step.x ? 'is-current' : '', readAt.has(k) ? 'is-read' : ''].join(' ').trim()
          return (
            <span key={k} role="listitem" className={cls}>
              <small>{k}</small>
              <b>{step.ways[k]}</b>
            </span>
          )
        })}
      </div>
      <p className="coin-ways__status" role="status">
        {step.phase === 'coin' || step.phase === 'start'
          ? `Coins in play: 1, 2 and 6 (unlimited). Target ${n}.`
          : step.phase === 'extend' ? `Coin ${step.coin} extends amount ${step.x}.` : null}
      </p>
      {step.fours.length > 0 && (
        <ul className="coin-ways__fours" aria-label="Ways with 4-coins">
          {step.fours.map(f => <li key={f.d}>{`${f.d} × 4: ${n} − ${4 * f.d} = ${f.rest}, ways ${f.value}`}</li>)}
          <li className="coin-ways__total">{`Total ${step.total}`}</li>
        </ul>
      )}
      <p className="coin-ways__caption">{step.message}</p>
    </section>
  )
}
