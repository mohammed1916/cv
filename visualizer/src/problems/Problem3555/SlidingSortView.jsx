import './SlidingSortView.css'

export default function SlidingSortView({ run, step }) {
  const { nums, k } = run.input
  const lo = step.left >= 0 ? step.left : null
  const hi = step.right >= 0 ? step.right : null
  const maxValue = Math.max(...nums)
  const start = step.start
  return (
    <figure className="sliding-sort-view">
      <div className="sliding-sort-view__bars" role="img" aria-label={`Sliding window of length ${k}`}>
        {nums.map((value, i) => {
          const inWindow = start >= 0 && i >= start && i < start + k
          const offset = inWindow ? i - start : -1
          const inSegment = lo !== null && offset >= lo && offset <= hi
          const cls = ['bar', inWindow ? 'bar--window' : '', inSegment ? 'bar--segment' : ''].join(' ').trim()
          return (
            <div key={i} className={cls}>
              <span className="bar__fill" style={{ height: `${(value / maxValue) * 100}%` }} />
              <span className="bar__value">{value}</span>
              <span className="bar__index">{i}</span>
            </div>
          )
        })}
      </div>
      {start >= 0 ? (
        <div className="sliding-sort-view__compare" aria-label="Window compared with its sorted copy">
          <span className="sliding-sort-view__row">{`window: ${step.window.join(' ')}`}</span>
          <span className="sliding-sort-view__row">{`sorted: ${step.target.join(' ')}`}</span>
          <span className="sliding-sort-view__row">{lo === null ? 'no mismatch yet' : `segment offsets ${lo} to ${hi === null ? '?' : hi}`}</span>
        </div>
      ) : null}
      <ol className="sliding-sort-view__answers" aria-label="Answers so far">
        {Array.from({ length: nums.length - k + 1 }, (_, s) => (
          <li key={s} className={s === start ? 'answer answer--current' : 'answer'}>
            {`${s}: ${step.answers[s] !== undefined ? step.answers[s] : '-'}`}
          </li>
        ))}
      </ol>
    </figure>
  )
}
