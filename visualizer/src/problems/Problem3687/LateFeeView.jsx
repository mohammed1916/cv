import './LateFeeView.css'

const TIER_LABEL = { flat: 'Flat: 1', double: 'Double: 2d', triple: 'Triple: 3d' }

// One row per book: its late-day count, the rule that applies, the fee, and the running total bar.
export default function LateFeeView({ run, step }) {
  if (!run || !step) return <section className="lf-view"><p className="lf-empty">Press Play to charge each book.</p></section>
  const days = run.input
  const maxTotal = Math.max(1, run.result)
  return (
    <section className="lf-view" aria-label="Late fee calculation">
      <ol className="lf-rows">
        {days.map((d, index) => {
          const done = index < step.fees.length
          const current = index === step.index
          const fee = done ? step.fees[index] : null
          const rowClass = ['lf-row', current ? 'lf-row--current' : '', done ? 'lf-row--done' : ''].join(' ')
          const tier = current && step.tier ? step.tier : (done ? (d === 1 ? 'flat' : d <= 5 ? 'double' : 'triple') : null)
          return (
            <li key={index} className={rowClass}>
              <span className="lf-book">Book {index + 1}</span>
              <span className="lf-days">{d} day{d === 1 ? '' : 's'} late</span>
              <span className={`lf-tier lf-tier--${tier || 'none'}`}>{tier ? TIER_LABEL[tier] : 'waiting'}</span>
              <span className="lf-fee">{fee === null ? '' : `fee ${fee}`}</span>
            </li>
          )
        })}
      </ol>
      <div className="lf-total" aria-label="Running total">
        <span>{`Running total ${step.total}`}</span>
        <div className="lf-bar"><div className="lf-bar-fill" style={{ width: `${Math.min(100, (step.total / maxTotal) * 100)}%` }} /></div>
      </div>
      <p className="lf-key">Flat charge 1 for one day. Double 2 per day for 2 to 5 days. Triple 3 per day beyond 5 days.</p>
    </section>
  )
}
