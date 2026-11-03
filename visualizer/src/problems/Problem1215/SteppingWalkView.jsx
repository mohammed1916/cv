import './SteppingWalkView.css'

export default function SteppingWalkView({ run, step }) {
  const { low, high } = run.input
  const digits = step.current === null ? [] : String(step.current).split('')
  return <div className="walk-view">
    <p className="walk-view__range">Range [{low}, {high}]{step.seed ? ` · walk from digit ${step.seed}` : ''}</p>
    <section className="walk-view__walk" aria-label="Current walk">
      <span className="walk-view__label">current</span>
      {digits.length === 0 && <span className="walk-view__empty">not started</span>}
      {digits.map((digit, k) => <span key={k} className={`walk-view__digit${k === digits.length - 1 ? ' is-last' : ''}`}>{digit}</span>)}
      {step.pushed.length > 0 && <span className="walk-view__arrows" aria-label="Neighbours queued">
        {step.pushed.map(value => <span key={value} className="walk-view__child">→ {value}</span>)}
      </span>}
      {step.current !== null && step.current > high && <span className="walk-view__badge is-skip">above high</span>}
      {step.current !== null && step.current <= high && step.current < low && <span className="walk-view__badge">below low</span>}
    </section>
    <section className="walk-view__queue" aria-label="Queue">
      <span className="walk-view__label">queue</span>
      {step.queue.length === 0 ? <span className="walk-view__empty">empty</span>
        : step.queue.map((value, k) => <span key={k} className="walk-view__chip">{value}</span>)}
    </section>
    <section className="walk-view__result" aria-label="Reported numbers">
      <span className="walk-view__label">reported</span>
      {step.result.length === 0 ? <span className="walk-view__empty">none yet</span>
        : step.result.map(value => <span key={value} className="walk-view__chip is-reported">{value}</span>)}
    </section>
  </div>
}
