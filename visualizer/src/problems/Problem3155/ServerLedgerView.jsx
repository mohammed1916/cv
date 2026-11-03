import './ServerLedgerView.css'

// One row of server tiles per center. For the current guess, the first k tiles are upgraded (U),
// the next ones are sold (S), and the rest are kept (K). A ledger compares the money with the cost.
export default function ServerLedgerView({ run, step }) {
  const centers = run.input
  const hasGuess = step.k >= 0
  const tiles = step.servers ?? 0
  return (
    <section className="ledger-view" aria-label="Server upgrade ledger">
      <div className="ledger-view__centers" role="list">
        {centers.map(([servers, money, sell, cost], c) => (
          <div key={c} role="listitem" className={`ledger-view__center${c === step.center ? ' is-current' : ''}`}>
            <span className="ledger-view__name">Center {c + 1}</span>
            <span className="ledger-view__meta">{servers} servers · money {money} · sell {sell} · upgrade {cost}</span>
            <span className="ledger-view__result">{c < step.results.length ? `upgrade ${step.results[c]}` : 'pending'}</span>
          </div>
        ))}
      </div>
      {step.center >= 0 && (
        <>
          <div className="ledger-view__tiles" aria-label="Server plan">
            {Array.from({ length: tiles }, (_, index) => {
              const kind = !hasGuess ? 'idle' : index < step.k ? 'upgrade' : index < step.servers ? 'sell' : 'idle'
              const label = kind === 'upgrade' ? 'U' : kind === 'sell' ? 'S' : '·'
              return <span key={index} className={`ledger-view__tile is-${kind}`} title={kind}>{label}</span>
            })}
          </div>
          <p className="ledger-view__ledger" role="status">
            {hasGuess
              ? `Money ${step.money} + sell ${step.sell} × ${step.sold} = ${step.funds}; upgrades cost ${step.cost} × ${step.k} = ${step.cost * step.k}. ${step.feasible ? 'Affordable.' : 'Not affordable.'}`
              : `Start with ${step.money} money and ${tiles} servers; test the most upgrades first.`}
          </p>
        </>
      )}
      {step.phase === 'done' && <p className="ledger-view__ledger">Final counts: [{step.results.join(', ')}]</p>}
    </section>
  )
}
