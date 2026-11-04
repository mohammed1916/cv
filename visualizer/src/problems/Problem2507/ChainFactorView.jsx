import './ChainFactorView.css'

// The chain of values, each replaced by the sum of its prime factors. The current value shows its factors,
// so the replacement reads as a sum of those factors.
export default function ChainFactorView({ step }) {
  const current = step.chain[step.index]
  return <section className="chain-factor" aria-label="Replacement chain">
    <ol className="chain-factor__chain" role="list">
      {step.chain.map((value, i) => <li key={i} className={`chain-factor__value${i === step.index ? ' chain-factor__value--current' : ''}`}>{value}</li>)}
    </ol>
    <p className="chain-factor__factors">
      {`${current} factors: ${step.factors.length ? step.factors.join(' × ') : 'none'}`}
      {step.factors.length > 1 || (step.factors.length === 1 && step.factors[0] !== current) ? ` → sum ${step.factors.reduce((a, b) => a + b, 0)}` : ''}
    </p>
    <p className="chain-factor__note">{step.phase === 'fixed' || step.phase === 'done' ? 'The sum equals the value itself, so it stops here.' : 'Each replacement uses the prime factors with repeats.'}</p>
  </section>
}
