import './LargestPartnerView.css'

// Bit rows for n and x, read from the top bit down. The last row is the AND of every number from x to n,
// which keeps only the bits where x and n agree above their highest differing bit.
export default function LargestPartnerView({ run, step }) {
  const { n } = run.input
  const width = n.toString(2).length
  const positions = Array.from({ length: width }, (_, k) => width - 1 - k)
  const nBit = position => (n >> position) & 1
  const xBit = position => (step.x >> position) & 1
  const diff = step.x === n ? -1 : Math.floor(Math.log2(step.x ^ n))
  const andBit = position => (step.x === n || position > diff ? nBit(position) : 0)
  const caption = step.action === 'set'
    ? `Bit ${step.bit} of x is set to 1, so x moves away from n only in lower bits.`
    : step.action === 'check'
      ? `Read bit ${step.bit} of n: lower bits of x are free.`
      : step.action === 'done' ? `The top bit of x (${width - 2}) differs from n's, so the AND of [x, n] is 0.` : 'Clear the top bit of n in x, then fill the rest.'

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
      <div className="partner-view__row">
        <span className="partner-view__label">AND [x, n]</span>
        {positions.map(p => (
          <span key={p} className={`partner-view__bit ${andBit(p) ? 'is-one' : 'is-clear'}`}>
            {andBit(p)}
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
