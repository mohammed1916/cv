import './MirrorBuildView.css'

// A palindrome is built from its first half (free digits) and a mirror of that half (derived digits).
// The query picks one first half out of 9 * 10^(h-1) choices; the bar shows how far along the query sits.
export default function MirrorBuildView({ intLength, h, step }) {
  const total = 9 * 10 ** (h - 1)
  const half = step.half ?? null
  const answer = step.answer === undefined || step.answer === null ? null : String(step.answer)
  const digits = answer && answer !== '-1' ? answer.split('') : []
  const q = step.q
  return (
    <figure className="mb-view">
      <div className="mb-row" aria-label="Palindrome digits">
        <span className="mb-label">length {intLength}</span>
        {Array.from({ length: intLength }, (_, k) => {
          const mirrorIndex = intLength - 1 - k
          const isFree = k < h
          const digit = digits[k] ?? '·'
          const cls = digits.length === 0 ? 'mb-tile mb-tile--empty' : isFree ? 'mb-tile mb-tile--free' : 'mb-tile mb-tile--mirror'
          return (
            <span key={k} className={cls} title={isFree ? `first half, position ${k}` : `mirror of position ${mirrorIndex}`}>
              {digit}
            </span>
          )
        })}
      </div>
      <div className="mb-row">
        <span className="mb-label">first half</span>
        <span className="mb-half">{half ?? '—'}</span>
        <span className="mb-label">rank</span>
        <span className="mb-half">{q === undefined ? '—' : `${q} of ${total}`}</span>
      </div>
      <div className="mb-bar" aria-label="Rank within the choices">
        <span className="mb-fill" style={{ width: q === undefined ? '0%' : `${Math.min(100, (q / total) * 100)}%` }} />
      </div>
      <figcaption>
        {answer === '-1' ? 'The first half needs more than ' + h + ' digit(s), so no palindrome exists.' : 'Blue digits are chosen; grey digits are copied from their mirror positions.'}
      </figcaption>
    </figure>
  )
}
