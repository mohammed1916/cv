// The input is a row; the cursor marks the value being read. The stack is drawn bottom to top.
export default function StackView({ run, step }) {
  const { nums } = run.input
  const stack = step.stack ?? []
  return (
    <div className="merge-stack-view">
      <div className="merge-input" role="img" aria-label={`Input ${nums.join(', ')}`}>
        {nums.map((v, i) => <div key={i} className={`merge-cell${i === step.index ? ' is-current' : i < step.index ? ' is-read' : ''}`}><small>{i}</small><strong>{v}</strong></div>)}
      </div>
      <div className="merge-stack" aria-label="Stack, top at the top">
        <small>top</small>
        {[...stack].reverse().map((v, i) => <div key={i} className={`merge-stack-item${i === 0 ? ' is-top' : ''}`}>{v}</div>)}
        {stack.length === 0 && <em>empty</em>}
      </div>
      {step.phase === 'merge' && <p>Merging {step.top} with {step.x}: gcd {step.gcd}, lcm {step.merged}.</p>}
    </div>
  )
}
