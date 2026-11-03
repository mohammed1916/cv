import './TransactionBalanceView.css'

const RANGE = 60

// Transactions as chips in order, a balance meter around zero, and the min-heap of kept negatives.
export default function TransactionBalanceView({ run, step }) {
  if (!run || !step) return <section className="tb-view"><p className="tb-empty">Press Play to process transactions in order.</p></section>
  const amounts = run.input
  const balance = step.balance
  const offset = Math.max(-RANGE, Math.min(RANGE, balance))
  const percent = 50 + (offset / RANGE) * 50
  return (
    <section className="tb-view" aria-label="Transaction balance walk">
      <div className="tb-chips" role="list">
        {amounts.map((x, p) => {
          const status = step.status[p]
          const classes = ['tb-chip', `tb-chip--${status}`]
          if (p === step.current) classes.push('tb-chip--current')
          return (
            <div key={p} role="listitem" className={classes.join(' ')}>
              <span className="tb-amount">{x > 0 ? `+${x}` : x}</span>
              <span className="tb-pos">#{p} {status}</span>
            </div>
          )
        })}
      </div>
      <div className="tb-meter" aria-label={`Balance ${balance}`}>
        <div className="tb-zero" />
        <div className={`tb-fill ${balance < 0 ? 'tb-fill--neg' : 'tb-fill--pos'}`} style={balance < 0 ? { right: '50%', width: `${50 - percent}%` } : { left: '50%', width: `${percent - 50}%` }} />
        <span className="tb-readout">{`balance ${balance}`}</span>
      </div>
      <div className="tb-heap">
        <span className="tb-heap-label">Kept negatives, smallest first (drop candidates):</span>
        {step.heap.length === 0 ? <span className="tb-none">none</span> : step.heap.map(item => (
          <span key={item.position} className="tb-heap-item">{`${item.amount} (#${item.position})`}</span>
        ))}
      </div>
      <p className="tb-key">Kept: solid. Dropped: struck through. Gold: current transaction. Dropping the most negative amount never makes an earlier prefix negative.</p>
      <p className="tb-count">{`Kept so far: ${step.kept}`}</p>
    </section>
  )
}
