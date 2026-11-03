import './FixedPointView.css'

export default function FixedPointView({ run, step }) {
  const nums = run.input.nums
  return (
    <section className="fixed-point" aria-label="Fixed point table">
      <ol className="fixed-point__values">
        {nums.map((value, p) => (
          <li key={p} className={p === step.position ? 'is-current' : p < step.position ? 'is-done' : ''}>
            <span>pos {p}</span>
            <strong>{value}</strong>
          </li>
        ))}
      </ol>
      <p role="status">{step.value === null ? step.message : `Value ${step.value} at original position ${step.position}`}</p>
      <div className="fixed-point__row" aria-label="Best count for each survivor number">
        {step.dp.map((v, k) => (
          <div key={k} className={`fixed-point__cell${step.hits.includes(k - 1) ? ' is-hit' : ''}`}>
            <span>k={k}</span>
            <strong>{v < 0 ? '-' : v}</strong>
          </div>
        ))}
      </div>
      <p className="fixed-point__note">Cell k holds the best fixed-point count when exactly k values are kept. A value adds one when it equals the survivor index it would take.</p>
    </section>
  )
}
