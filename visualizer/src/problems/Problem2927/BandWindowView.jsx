import './BandWindowView.css'

export default function BandWindowView({ run, step }) {
  const { n, limit } = run.input
  const values = Array.from({ length: limit + 1 }, (_, b) => b)
  const inBand = b => step.low !== null && b >= step.low && b <= step.high
  return (
    <div className="band-window-view">
      <p className="band-rule">The first child takes a candies. The other two share the rest, and each must stay within the limit. The valid second amounts form a band on the number line.</p>
      <div className="band-line" role="img" aria-label={`Second child amounts from 0 to ${limit}`}>
        {values.map(b => (
          <span key={b} className={`band-cell${inBand(b) ? ' is-band' : ''}${step.a >= 0 && step.rest !== null && step.rest - b >= 0 && step.rest - b <= limit && inBand(b) ? ' is-third-ok' : ''}`}>
            {b}
          </span>
        ))}
      </div>
      <dl className="band-facts">
        <div><dt>Candies</dt><dd>{n}</dd></div>
        <div><dt>First child a</dt><dd>{step.a >= 0 ? step.a : 'none'}</dd></div>
        <div><dt>Rest n - a</dt><dd>{step.rest ?? 'none'}</dd></div>
        <div><dt>Band</dt><dd>{step.low === null ? 'none' : `${step.low} to ${step.high}`}</dd></div>
        <div><dt>Running total</dt><dd>{step.total}</dd></div>
      </dl>
      <output className="band-message" aria-label="Band status">{step.message}</output>
    </div>
  )
}
