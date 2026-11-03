import './DivisibleGameView.css'

export default function DivisibleGameView({ run, step }) {
  const nums = run.input.nums
  const weights = step.weights || []
  return (
    <figure className="divisible-game" aria-label="Divisible game weights">
      <p className="divisible-game__k">{step.k ? `Divisor k = ${step.k}` : 'Pick a divisor k'}</p>
      <ol className="divisible-game__row">
        {nums.map((v, i) => {
          const hasWeight = i < weights.length
          const positive = hasWeight && weights[i] > 0
          const cls = ['divisible-game__cell', hasWeight ? (positive ? 'is-plus' : 'is-minus') : '', i === step.i ? 'is-current' : ''].filter(Boolean).join(' ')
          return (
            <li key={i} className={cls}>
              <span className="divisible-game__value">{v}</span>
              <span className="divisible-game__sign">{hasWeight ? (positive ? `+${weights[i]}` : `${weights[i]}`) : '·'}</span>
            </li>
          )
        })}
      </ol>
      <dl className="divisible-game__stats">
        <div><dt>Ending here</dt><dd>{step.cur ?? '-'}</dd></div>
        <div><dt>Best for this k</dt><dd>{step.kBest ?? '-'}</dd></div>
        <div><dt>Best overall</dt><dd>{step.bestScore ?? '-'}{step.bestK ? ` (k ${step.bestK})` : ''}</dd></div>
      </dl>
      <p className="divisible-game__legend">Green cells are multiples of k (added). Red cells are not (subtracted).</p>
    </figure>
  )
}
