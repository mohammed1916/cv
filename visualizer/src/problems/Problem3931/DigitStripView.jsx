import './DigitStripView.css'

export default function DigitStripView({ run, step }) {
  const digits = run.input.text.split('').map(Number)
  return (
    <section className="digit-strip" aria-label="Adjacent digit check">
      <ol className="digit-strip__row">
        {digits.map((d, i) => {
          const inPair = step.i >= 0 && (i === step.i || i === step.i + 1)
          return (
            <li key={i} className={`digit-strip__tile${inPair ? ' is-pair' : ''}`}>
              <strong>{d}</strong>
              <span>pos {i}</span>
            </li>
          )
        })}
      </ol>
      {step.i >= 0 && (
        <p className={`digit-strip__gap${step.ok ? ' is-ok' : ' is-bad'}`} role="status">
          {digits[step.i]} to {digits[step.i + 1]}: gap {step.gap} {step.ok ? '(within two)' : '(more than two)'}
        </p>
      )}
      {step.i < 0 && <p role="status">{step.message}</p>}
      {step.ok !== null && step.i < 0 && <output>{step.ok ? 'Every pair passes' : 'A pair fails'}</output>}
    </section>
  )
}
