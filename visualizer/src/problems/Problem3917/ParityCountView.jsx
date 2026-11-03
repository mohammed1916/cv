import './ParityCountView.css'

export default function ParityCountView({ run, step }) {
  const nums = run.input.nums
  const verdict = step.j >= 0
    ? `${nums[step.i]} and ${nums[step.j]} have ${step.match ? 'opposite' : 'the same'} parity`
    : step.i >= 0 ? `Counting later indices for index ${step.i}` : 'Each index counts later values with opposite parity'
  return (
    <section className="parity-count" aria-label="Opposite parity counts">
      <ol className="parity-count__row">
        {nums.map((value, index) => {
          const role = index === step.i ? 'source' : index === step.j ? 'target' : step.i >= 0 && index > step.i ? 'later' : 'idle'
          return (
            <li key={index} className={`parity-count__cell parity-count__cell--${role}`}>
              <span className="parity-count__index">{index}</span>
              <strong>{value}</strong>
              <span className="parity-count__badge">{value % 2 ? 'odd' : 'even'}</span>
            </li>
          )
        })}
      </ol>
      <p className="parity-count__verdict" role="status">{verdict}</p>
      <div className="parity-count__answer" aria-label="Answer so far">
        {step.answer.map((count, index) => (
          <span key={index} className={index === step.i ? 'is-current' : ''}>answer[{index}] = {count}</span>
        ))}
      </div>
    </section>
  )
}
