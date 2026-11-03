import './DigitSquareView.css'

export default function DigitSquareView({ run, step }) {
  const digits = String(run.input).split('').map(Number)
  return (
    <section className="digit-square" aria-label="Digit square totals">
      <div className="digit-square__digits" role="list" aria-label="Digits of n">
        {digits.map((d, i) => (
          <div key={i} role="listitem" className={`digit-square__tile${step.index === i ? ' digit-square__tile--active' : ''}${step.index > i ? ' digit-square__tile--done' : ''}`}>
            <span className="digit-square__digit">{d}</span>
            <span className="digit-square__sq">{`square ${d * d}`}</span>
          </div>
        ))}
      </div>
      <dl className="digit-square__totals">
        <dt>Sum of squares</dt><dd>{step.squares}</dd>
        <dt>Digit sum</dt><dd>{step.digits}</dd>
        <dt>Difference (goal 50)</dt><dd>{step.squares - step.digits}</dd>
      </dl>
      <p className="digit-square__verdict">{step.phase === 'done' ? (step.good ? 'Good integer' : 'Not a good integer') : 'Totals are building...'}</p>
    </section>
  )
}
