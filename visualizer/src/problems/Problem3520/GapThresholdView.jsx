import './GapThresholdView.css'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

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
  const verdict = step.hi === mid ? true : step.lo === (mid ?? -2) + 1 ? false : null
  return (
    <section className="gap-view" aria-label="Inversion pairs and threshold search">
      <div className="gap-bars" aria-label="Values">
        {nums.map((v, i) => (
          <div key={i} className={`gap-col${i === pi || i === pj ? ' gap-col--pair' : ''}${i === pi ? ' gap-col--left' : ''}`}>
            <b className="gap-tag">{i === pi ? 'i' : ''}{i === pj ? 'j' : ''}</b>
            <span className="gap-value">{v}</span>
            <span className="gap-bar" style={{ height: `${Math.max(8, ((v - min) / span) * 90 + 10)}px` }} />
            <small>{i}</small>
          </div>
        ))}
      </div>
      {lo !== null && lo !== undefined && hi !== null && hi !== undefined && (
        <AnswerRangeBar title="Threshold search" min={0} max={Math.max(span, hi, 1)} low={lo} high={hi}
          probe={mid !== null && mid !== undefined && verdict !== null ? mid : null} verdict={verdict} />
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
