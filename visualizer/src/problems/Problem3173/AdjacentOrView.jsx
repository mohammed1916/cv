import './AdjacentOrView.css'

// Each value as a row of bits. The current neighbour pair is shown with its OR written underneath.
export default function AdjacentOrView({ run, step }) {
  const nums = run.input
  const width = Math.max(1, ...nums.map(value => value.toString(2).length))
  const bits = value => Array.from({ length: width }, (_, k) => (value >> (width - 1 - k)) & 1)
  return (
    <section className="adjacent-or" aria-label="Adjacent OR pairs">
      <div className="adjacent-or__values" role="table" aria-label="Values as bits">
        {nums.map((value, index) => {
          const pairRole = index === step.i ? 'left' : index === step.i + 1 ? 'right' : ''
          return (
            <div key={index} role="row" className={`adjacent-or__row${pairRole ? ` is-${pairRole}` : ''}`}>
              <span role="cell" className="adjacent-or__index">{index}</span>
              <span role="cell" className="adjacent-or__value">{value}</span>
              <span role="cell" className="adjacent-or__bits">
                {bits(value).map((bit, k) => <span key={k} className={`adjacent-or__bit${bit ? ' is-one' : ''}`}>{bit}</span>)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="adjacent-or__answer" aria-label="Answer so far">
        {Array.from({ length: Math.max(0, nums.length - 1) }, (_, k) => (
          <span key={k} className={`adjacent-or__result${k < step.answer.length ? ' is-filled' : ''}${k === step.i ? ' is-current' : ''}`}>
            {k < step.answer.length ? step.answer[k] : '·'}
          </span>
        ))}
      </div>
      <p className="adjacent-or__caption" role="status">{step.message}</p>
    </section>
  )
}
