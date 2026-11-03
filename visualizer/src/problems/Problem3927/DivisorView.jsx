import './DivisorView.css'

export default function DivisorView({ run, step }) {
  const nums = run.input.nums
  return (
    <section className="divisor" aria-label="Divisor replacement">
      <p className="divisor__present"><span>Present values</span> {step.present.map(v => (
        <code key={v} className="divisor__value">{v}</code>
      ))}</p>
      <ol className="divisor__row">
        {nums.map((x, i) => (
          <li key={i} className={`divisor__cell${i === step.index ? ' is-current' : i < step.index ? ' is-done' : ''}`}>
            <span>pos {i}</span>
            <strong>{x}</strong>
          </li>
        ))}
      </ol>
      {step.candidate !== null && step.value !== null && (
        <p className={`divisor__test${step.divides === true ? ' is-yes' : step.divides === false ? ' is-no' : ''}`} role="status">
          {step.divides === true ? `${step.candidate} divides ${step.value}: ${step.value} becomes ${step.candidate}` : step.divides === false ? `${step.candidate} does not divide ${step.value}` : `Element ${step.value} settles at ${step.pick}`}
        </p>
      )}
      {step.candidate === null && <p role="status">{step.message}</p>}
      <output aria-label="Running total">Total so far: {step.total}</output>
    </section>
  )
}
