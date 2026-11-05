// Two bars: each operation shrinks the larger bar by the smaller one until a bar reaches zero.
const MAX = 60

export default function PairView({ run, step }) {
  const bar = (label, value) => <div className="pair-bar" key={label}>
    <span>{label} = {value}</span>
    <div className="pair-track" role="img" aria-label={`${label} is ${value}`}>
      <div className={`pair-fill${value === 0 ? ' is-zero' : ''}`} style={{ width: `${(value / MAX) * 100}%`, background: 'var(--primary)' }} />
    </div>
  </div>
  return (
    <div className="pair-view">
      {bar('num1', step.a)}
      {bar('num2', step.b)}
      <p>Operations so far: <strong>{step.ans}</strong></p>
      {step.subtracted && <p>The last step subtracted from {step.subtracted}.</p>}
      {step.a === 0 || step.b === 0 ? <p>One value is 0, so the count stops.</p> : null}
      {run.frames.length > 0 && <p>Starting pair: {run.input.num1} and {run.input.num2}.</p>}
    </div>
  )
}
