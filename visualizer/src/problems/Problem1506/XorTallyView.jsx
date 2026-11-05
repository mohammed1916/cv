import './XorTallyView.css'

const BITS = 7

function bits(value) {
  return Array.from({ length: BITS }, (_, b) => ((value >> (BITS - 1 - b)) & 1 ? '1' : '0')).join('')
}

// Cards per supplied node, a 7-bit view of the running XOR, and the XOR log so far. Paired values cancel to 0 bits.
export default function XorTallyView({ run, step }) {
  const { vals, children } = run.input
  const log = run.frames.slice(1, run.frames.indexOf(step) + 1).filter(f => f.operand !== undefined)
  return (
    <figure className="xt-view">
      <div className="xt-running" aria-label="Running XOR">
        Running XOR <strong>{step.acc}</strong>
        <code className="xt-bits" aria-label={`binary ${bits(step.acc)}`}>{bits(step.acc)}</code>
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
      <div className="xt-log" aria-label="XOR log">
        {log.map((f, k) => (
          <span key={k} className={f.role === 'child' ? 'xt-op xt-op--child' : 'xt-op'}>{f.role === 'child' ? 'child ' : ''}{f.operand}</span>
        ))}
      </div>
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
