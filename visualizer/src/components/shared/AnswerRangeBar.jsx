import './AnswerRangeBar.css'

/**
 * The search interval of a binary search on the answer: the bounds `low` and `high` inside the
 * domain `min`..`max`, and an optional `probe` candidate with its feasibility `verdict`.
 */
export default function AnswerRangeBar({ title = 'Answer search', min, max, low, high, probe = null, verdict = null }) {
  const span = Math.max(1, max - min)
  const pct = value => `${((value - min) / span) * 100}%`
  const width = `${Math.max(0, ((high - low) / span) * 100)}%`
  return <section className="answer-range-bar" aria-label={title}>
    <h3>{title}</h3>
    <div className="answer-range-bar__track" role="img" aria-label={`Answers from ${min} to ${max}; search range ${low} to ${high}`}>
      <div className="answer-range-bar__range" style={{ left: pct(low), width }} />
      {probe !== null && <div className={`answer-range-bar__probe ${verdict ? 'is-ok' : 'is-no'}`} style={{ left: pct(probe) }} />}
    </div>
    <p>{`Range ${low} to ${high}`}{probe !== null ? `; candidate ${probe} is ${verdict ? 'feasible' : 'not feasible'}` : ''}</p>
  </section>
}
