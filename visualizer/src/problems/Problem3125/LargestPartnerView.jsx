import './LargestPartnerView.css'

// Bit rows for n and x, read from the top bit down. Ones of n are filled, zeros of n are open slots.
export default function LargestPartnerView({ run, step }) {
  const { n } = run.input
  const width = n.toString(2).length
  const positions = Array.from({ length: width }, (_, k) => width - 1 - k)
  const nBit = position => (n >> position) & 1
  const xBit = position => (step.x >> position) & 1
  const caption = step.action === 'set'
    ? 'Open slot in n: x takes a 1 here.'
    : step.action === 'skip'
      ? 'Taken by n: x must keep a 0 here.'
      : step.action === 'done' ? 'Final x: every open slot below the top bit is used.' : 'Read the bits of n from the top down.'

  return (
    <section className="partner-view" aria-label="Bit pairing for the largest partner">
      <div className="partner-view__row">
        <span className="partner-view__label">n = {n}</span>
        {positions.map(p => (
          <span key={p} className={`partner-view__bit ${nBit(p) ? 'is-one' : 'is-open'}${p === step.bit ? ' is-current' : ''}`}>
            {nBit(p)}
          </span>
        ))}
      </div>
      <div className="partner-view__row">
        <span className="partner-view__label">x = {step.x}</span>
        {positions.map(p => (
          <span key={p} className={`partner-view__bit ${xBit(p) ? 'is-set' : 'is-clear'}${p === step.bit ? ' is-current' : ''}`}>
            {xBit(p)}
          </span>
        ))}
      </div>
      <div className="partner-view__row partner-view__positions" aria-hidden="true">
        <span className="partner-view__label">bit</span>
        {positions.map(p => <span key={p} className="partner-view__index">{p}</span>)}
      </div>
      <p className="partner-view__caption">{caption}</p>
    </section>
  )
}
