import './LargeIndexView.css'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

// Values stay hidden, as in the reader problem; only ranges, comparisons and the answer are drawn.
export default function LargeIndexView({ run, step }) {
  const n = run.input.array.length
  const inWindow = i => i >= step.lo && i <= step.hi
  const roleOf = i => {
    if (step.answer !== null && step.phase === 'done' && i === step.answer) return 'answer'
    if (step.left && i >= step.left[0] && i <= step.left[1]) return 'left'
    if (step.right && i >= step.right[0] && i <= step.right[1]) return 'right'
    if (step.phase === 'narrow' && step.left === null && i === step.hi && step.lo === step.hi) return 'leftover'
    return inWindow(i) ? 'window' : 'dropped'
  }
  const symbol = step.cmp === null ? '?' : step.cmp > 0 ? '>' : step.cmp < 0 ? '<' : '='
  return (
    <section className="large-index" aria-label="Hidden array search window">
      <ol className="large-index__cells" aria-label="Indices of the hidden array">
        {Array.from({ length: n }, (_, i) => {
          const role = roleOf(i)
          return <li key={i} className={`large-index__cell large-index__cell--${role}`} aria-label={`index ${i}, ${role}`}>
            <span className="large-index__index">{i}</span>
            <span className="large-index__ptrs" aria-hidden="true">{[step.lo === i && 'lo', step.hi === i && 'hi'].filter(Boolean).join('/')}</span>
            <span className="large-index__value" aria-hidden="true">?</span>
          </li>
        })}
      </ol>
      <AnswerRangeBar title="Index search range" min={0} max={Math.max(0, n - 1)} low={step.lo} high={step.hi} />
      <div className="large-index__compare" role="status">
        <span>{step.left ? `sum[${step.left[0]}..${step.left[1]}]` : 'no comparison yet'}</span>
        <strong aria-label={`comparison ${symbol}`}>{symbol}</strong>
        <span>{step.right ? `sum[${step.right[0]}..${step.right[1]}]` : ''}</span>
      </div>
      <p className="large-index__meta">Comparisons so far: {step.queries}. Window: [{step.lo}, {step.hi}].</p>
    </section>
  )
}
