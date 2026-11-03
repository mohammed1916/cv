import './DigitWindowView.css'

export default function DigitWindowView({ run, step }) {
  if (!run || !step) return <p className="dw-empty">Press Play to test each index.</p>
  const digits = [...run.input.s]
  const inWindow = i => step.start !== null && step.start >= 0 && i >= step.start && i <= step.index
  return (
    <section className="dw" aria-label="Digit string with the window ending at the current index">
      <div className="dw-tape" role="img" aria-label={`Digits ${run.input.s}`}>
        {digits.map((d, i) => (
          <div key={i} className={`dw-cell${inWindow(i) ? ' dw-cell--window' : ''}${i === step.index ? ' dw-cell--index' : ''}${step.phase === 'match' && inWindow(i) ? ' dw-cell--good' : ''}`}>
            <span className="dw-digit">{d}</span>
            <span className="dw-pos">{i}</span>
          </div>
        ))}
      </div>
      {step.index >= 0 ? (
        <dl className="dw-compare">
          <dt>Index i written out</dt><dd><code>{step.text}</code></dd>
          <dt>Digits ending at i</dt><dd><code>{step.window === null ? 'not enough digits' : step.window}</code></dd>
          <dt>Verdict</dt><dd>{step.ok === null ? '' : step.ok ? 'equal: i is good' : 'different'}</dd>
        </dl>
      ) : null}
      <p className="dw-result">Good so far: {step.result.length ? step.result.join(', ') : 'none'}</p>
      <p className="dw-message">{step.message}</p>
    </section>
  )
}
