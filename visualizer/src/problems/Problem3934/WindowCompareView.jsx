import './WindowCompareView.css'

export default function WindowCompareView({ run, step }) {
  const nums = run.input.nums
  const n = nums.length
  const inStart = idx => step.i >= 0 && step.longest !== null && idx >= step.i && idx < step.i + (step.length ?? step.longest + 1)
  const inOther = idx => step.j >= 0 && idx >= step.j && idx < step.j + (step.shared ?? 0) + 1 && idx < n
  return (
    <section className="window-compare" aria-label="Start index comparison">
      <ol className="window-compare__row">
        {nums.map((v, idx) => (
          <li key={idx} className={[
            inStart(idx) ? 'is-start-window' : '',
            inOther(idx) ? 'is-other-window' : '',
          ].join(' ')}>
            <span>{idx}</span>
            <strong>{v}</strong>
          </li>
        ))}
      </ol>
      <p role="status">{step.message}</p>
      <dl className="window-compare__facts">
        <div><dt>Best length</dt><dd>{step.best}</dd></div>
        <div><dt>Start</dt><dd>{step.i >= 0 ? step.i : '-'}</dd></div>
        <div><dt>Other start</dt><dd>{step.j >= 0 ? step.j : '-'}</dd></div>
        <div><dt>Shared prefix</dt><dd>{step.shared ?? '-'}</dd></div>
        <div><dt>Candidate length</dt><dd>{step.length ?? '-'}</dd></div>
      </dl>
    </section>
  )
}
