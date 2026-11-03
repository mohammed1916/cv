import './PolynomialView.css'

function Row({ label, values, activeIndex, className }) {
  return (
    <div className={`poly-row ${className}`} role="group" aria-label={label}>
      <span className="poly-row__label">{label}</span>
      {values.map((value, k) => (
        <span key={k} className={`poly-cell ${k === activeIndex ? 'poly-cell--active' : ''}`}>
          <b>{value}</b>
          <small>{`x^${k}`}</small>
        </span>
      ))}
    </div>
  )
}

export default function PolynomialView({ run, step }) {
  const { a, b } = run.input
  const i = step.i
  const j = step.j
  const target = i >= 0 ? i + j : -1
  return (
    <figure className="polynomial-view">
      <Row label="a" values={a} activeIndex={i} className="poly-row--a" />
      <Row label="b" values={b} activeIndex={j} className="poly-row--b" />
      <div className="poly-row poly-row--result" role="group" aria-label="Product coefficients">
        <span className="poly-row__label">product</span>
        {step.result.map((value, k) => (
          <span key={k} className={`poly-cell ${k === target ? 'poly-cell--target' : ''}`}>
            <b>{value}</b>
            <small>{`x^${k}`}</small>
          </span>
        ))}
      </div>
      <p className="polynomial-view__equation" aria-live="polite">
        {i >= 0 ? `x^${i} times x^${j} gives x^${target}: ${a[i]} times ${b[j]} adds ${a[i] * b[j]}` : 'Pairs of terms will be combined into the matching degree.'}
      </p>
    </figure>
  )
}
