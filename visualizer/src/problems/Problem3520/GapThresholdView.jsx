import './GapThresholdView.css'

// Bars show each value. The pair being tested is outlined. The threshold range is a bar from lo to hi, with the midpoint marked.
export default function GapThresholdView({ run, step }) {
  if (!run || !step) return <section className="gap-view"><p className="gap-empty">Press Play to count inversions and search for the threshold.</p></section>
  const { nums, k } = run.input
  const { pair, counted, lo, hi, mid, limit, result } = step
  const max = Math.max(...nums)
  const min = Math.min(...nums)
  const span = Math.max(1, max - min)
  const pct = value => `${((value - min) / span) * 100}%`
  const [pi, pj] = pair || [-1, -1]
  return (
    <section className="gap-view" aria-label="Inversion pairs and threshold search">
      <div className="gap-bars" aria-label="Values">
        {nums.map((v, i) => (
          <div key={i} className={`gap-col${i === pi || i === pj ? ' gap-col--pair' : ''}${i === pi ? ' gap-col--left' : ''}`}>
            <span className="gap-value">{v}</span>
            <span className="gap-bar" style={{ height: `${Math.max(8, ((v - min) / span) * 90 + 10)}px` }} />
            <small>{i}</small>
          </div>
        ))}
      </div>
      {lo !== null && lo !== undefined && hi !== null && hi !== undefined && (
        <div className="gap-range" aria-label={`Threshold range ${lo} to ${hi}`}>
          <span className="gap-range-track">
            <span className="gap-range-fill" style={{ left: pct(Math.min(lo, max)), width: `${Math.max(0, ((Math.min(hi, max) - Math.min(lo, max)) / span) * 100)}%` }} />
            {mid !== null && mid !== undefined && <span className="gap-mid" style={{ left: pct(Math.min(mid, max)) }} title={`mid ${mid}`} />}
          </span>
          <span className="gap-range-text">threshold in [{lo}, {hi}]{mid !== null && mid !== undefined ? `, mid ${mid}` : ''}</span>
        </div>
      )}
      <p className="gap-count">
        {limit !== undefined && limit !== Infinity ? `limit ${limit}` : limit === Infinity ? 'limit infinity' : ''}
        {' '}pairs counted: {counted}, k = {k}{result !== undefined && result !== null ? `, answer ${result}` : ''}
      </p>
      {pair && <p className="gap-pair">Pair ({pi}, {pj}): {nums[pi]} − {nums[pj]} = {step.gap}</p>}
      <p className="gap-summary">{step.message}</p>
    </section>
  )
}
