import './XorTallyView.css'

// Card per supplied node: the value, how many times it has been listed as a child, and the running XOR.
export default function XorTallyView({ run, step }) {
  const { vals, children } = run.input
  return (
    <figure className="xt-view">
      <div className="xt-running" aria-label="Running XOR">
        Running XOR <strong>{step.acc}</strong>
      </div>
      <div className="xt-grid">
        {vals.map((v, i) => {
          const listed = step.tally.get(v) || 0
          const cls = i === step.node ? 'xt-card xt-card--now' : listed === 0 && i !== step.node && step.phase !== 'start' ? 'xt-card xt-card--free' : 'xt-card'
          return (
            <div key={i} className={cls}>
              <span className="xt-index">node {i}</span>
              <span className="xt-value">{v}</span>
              <span className="xt-meta">children: {children[i].length ? children[i].join(', ') : 'none'}</span>
              <span className="xt-meta">listed as a child: {listed}×</span>
            </div>
          )
        })}
      </div>
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
