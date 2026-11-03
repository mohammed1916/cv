import './DigitWindowView.css'

export default function DigitWindowView({ run, step }) {
  const { nums, x } = run.input
  const inWindow = i => step.l >= 0 && step.r >= step.l && i >= step.l && i <= step.r
  return (
    <section className="digit-window" aria-label="Digit window">
      <div className="digit-window__cells" role="list" aria-label="Values">
        {nums.map((v, i) => (
          <div key={i} role="listitem" className={`digit-window__cell${inWindow(i) ? ' digit-window__cell--in' : ''}`}>
            <span>{v}</span><small>{i}</small>
          </div>
        ))}
      </div>
      <dl className="digit-window__state">
        <dt>Target digit x</dt><dd>{x}</dd>
        <dt>Window sum</dt><dd>{step.sum ?? '-'}</dd>
        <dt>First and last digit</dt><dd>{step.first === null ? '-' : `${step.first} and ${step.last}`}</dd>
        <dt>Matching subarrays</dt><dd>{step.count}</dd>
      </dl>
      <p className={`digit-window__verdict${step.hit ? ' digit-window__verdict--hit' : ''}`}>{step.message}</p>
    </section>
  )
}
