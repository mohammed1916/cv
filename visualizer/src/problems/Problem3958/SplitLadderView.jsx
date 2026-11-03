import './SplitLadderView.css'

export default function SplitLadderView({ run, step }) {
  const n = run.input.n
  const x = step.x
  const a = step.a
  const parts = a ? [a, x - a] : []
  return (
    <figure className="split-ladder" aria-label="Split cost table">
      <figcaption>Cheapest cost to reduce each total to ones</figcaption>
      <ol className="split-ladder__row">
        {Array.from({ length: n }, (_, i) => i + 1).map(v => {
          const known = step.best[v] !== null && step.best[v] !== undefined
          const cls = ['split-ladder__cell', v === x ? 'is-current' : '', parts.includes(v) ? 'is-part' : '', known ? 'is-known' : ''].filter(Boolean).join(' ')
          return (
            <li key={v} className={cls}>
              <span className="split-ladder__total">{v}</span>
              <span className="split-ladder__cost">{known ? step.best[v] : '?'}</span>
            </li>
          )
        })}
      </ol>
      <div className="split-ladder__formula" aria-label="Current split">
        {a ? (
          <>
            <span>{`${a} · ${x - a}`}</span>
            <span>{`+ best[${a}] + best[${x - a}] = ${step.cand}`}</span>
          </>
        ) : (
          <span>{phaseText(step.phase, x)}</span>
        )}
      </div>
    </figure>
  )
}

function phaseText(phase, x) {
  if (phase === 'done') return 'Final cost read from the last cell'
  return x ? `Current total ${x}` : 'Waiting to start'
}
