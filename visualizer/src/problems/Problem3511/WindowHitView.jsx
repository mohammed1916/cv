import './WindowHitView.css'

// The array with replaced positions marked. Each non-positive window is listed; the current window is outlined and shows whether a replaced position already lies inside it.
export default function WindowHitView({ run, step }) {
  if (!run || !step) return <section className="win-view"><p className="win-empty">Press Play to find the windows that are not positive.</p></section>
  const nums = run.input
  const { replaced, bad, current, window: w } = step
  const inWindow = i => w && i >= w.l && i <= w.r
  return (
    <section className="win-view" aria-label="Windows of length at least three">
      <div className="win-array" aria-label="Array">
        {nums.map((v, i) => (
          <span key={i} className={`win-cell${replaced.includes(i) ? ' win-cell--replaced' : ''}${inWindow(i) ? ' win-cell--window' : ''}`}>
            <b className="win-tag">{w && i === w.l ? 'l' : ''}{w && i === w.r ? 'r' : ''}</b>
            {v}
            <small>{replaced.includes(i) ? 'replaced' : i}</small>
          </span>
        ))}
      </div>
      <ul className="win-list" aria-label="Windows that are not positive">
        {bad.map((item, index) => (
          <li key={`${item.l}-${item.r}`} className={`win-item${index === current ? ' win-item--current' : ''}${index < current ? ' win-item--done' : ''}`}>
            [{item.l}, {item.r}] sum {item.sum}
          </li>
        ))}
        {bad.length === 0 && <li className="win-item">no window to fix</li>}
      </ul>
      <p className="win-summary">Replaced so far: {replaced.length}. {step.message}</p>
    </section>
  )
}
