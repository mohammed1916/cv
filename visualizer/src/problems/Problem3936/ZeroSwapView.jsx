import './ZeroSwapView.css'

export default function ZeroSwapView({ run, step }) {
  const n = run.input.nums.length
  return (
    <section className="zero-swap" aria-label="Zeros and swaps">
      <ol className="zero-swap__row">
        {step.arr.map((v, i) => {
          const zoneTail = i >= step.boundary
          const cls = [
            zoneTail ? 'is-tail' : 'is-head',
            step.head.includes(i) ? 'is-misplaced-zero' : '',
            step.tail.includes(i) ? 'is-misplaced-value' : '',
            i === step.left || i === step.right ? 'is-swapped' : '',
          ].join(' ')
          return (
            <li key={i} className={`zero-swap__cell ${cls}`}>
              <span>{i}</span>
              <strong>{v}</strong>
              <em>{v === 0 ? 'zero' : 'value'}</em>
            </li>
          )
        })}
      </ol>
      <p className="zero-swap__boundary">Zeros belong in positions {step.boundary} to {n - 1}.</p>
      <p role="status">{step.message}</p>
      <output aria-label="Swaps so far">Swaps: {step.swaps}</output>
    </section>
  )
}
