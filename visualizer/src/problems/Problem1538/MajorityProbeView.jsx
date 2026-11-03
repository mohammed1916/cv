import './MajorityProbeView.css'

const LABEL = { same: 'matches bit 0', other: 'differs from bit 0', unknown: 'not yet compared' }

// Bit values stay hidden; the view shows only which indices share bit 0 and the probe window.
export default function MajorityProbeView({ run, step }) {
  const n = run.input.bits.length
  const tuple = step.tuple ?? []
  const classOf = i => (step.same[i] === null ? 'unknown' : step.same[i] ? 'same' : 'other')
  const outcome = step.lastAnswer === null ? 'no reading yet' : `reader answers ${step.lastAnswer}`
  return (
    <section className="majority-probe" aria-label="Hidden bits grouped by agreement with bit 0">
      <ol className="majority-probe__cells" aria-label="Index classes">
        {Array.from({ length: n }, (_, i) => {
          const role = classOf(i)
          const probed = tuple.includes(i)
          return <li key={i} className={`majority-probe__cell majority-probe__cell--${role} ${probed ? 'majority-probe__cell--probed' : ''} ${step.answer === i ? 'majority-probe__cell--answer' : ''}`}
            aria-label={`index ${i}, ${LABEL[role]}${probed ? ', in the current query' : ''}`}>
            <span className="majority-probe__index">{i}</span>
            <span className="majority-probe__mark" aria-hidden="true">{role === 'same' ? '=' : role === 'other' ? '≠' : '?'}</span>
          </li>
        })}
      </ol>
      <p className="majority-probe__query">
        {tuple.length ? `Query window: [${tuple.join(', ')}]` : 'No query window open'} · {outcome} · queries used {step.queries}
      </p>
      <ul className="majority-probe__legend" aria-label="Legend">
        <li><span className="majority-probe__swatch majority-probe__swatch--same" /> matches bit 0</li>
        <li><span className="majority-probe__swatch majority-probe__swatch--other" /> differs from bit 0</li>
        <li><span className="majority-probe__swatch majority-probe__swatch--probed" /> in the current query</li>
      </ul>
    </section>
  )
}
