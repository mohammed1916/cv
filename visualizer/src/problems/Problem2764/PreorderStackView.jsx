import './PreorderStackView.css'

export default function PreorderStackView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ps-view" aria-label="Preorder stack check">
        <p className="ps-empty">Press Play to read the pairs one at a time against the open path.</p>
      </section>
    )
  }

  const pairs = run.input
  const current = step.i ?? -1
  const verdict = step.ok === false ? 'Rejected' : step.ok === true ? 'Accepted' : 'Checking'
  const closed = step.popped || []
  const stack = step.stack || []

  return (
    <section className="ps-view" aria-label="Preorder stack check">
      <h3 className="ps-title">Pairs read so far against the open path</h3>

      <ol className="ps-pairs" aria-label="Pairs in input order">
        {pairs.map(([node, parent], k) => {
          const state = k < current ? 'read' : k === current ? 'now' : 'ahead'
          return (
            <li key={k} className={`ps-pair ps-pair--${state}`}>
              <span className="ps-node">{node}</span>
              <span className="ps-parent-tag">{parent === -1 ? 'root' : `parent ${parent}`}</span>
            </li>
          )
        })}
      </ol>

      <div className="ps-board">
        <div className="ps-column">
          <h4 className="ps-heading">Open path (top first)</h4>
          {stack.length === 0 && <p className="ps-muted">Empty</p>}
          <ul className="ps-stack" aria-label="Open path stack">
            {[...stack].reverse().map((node, k) => {
              const count = step.counts?.[node] || 0
              const isTop = k === 0
              const isParent = node === step.parent
              return (
                <li key={node} className={`ps-cell${isTop ? ' ps-cell--top' : ''}${isParent ? ' ps-cell--parent' : ''}`}>
                  <span className="ps-cell-value">{node}</span>
                  <span className="ps-slots" aria-label={`${count} of 2 children`}>
                    {[0, 1].map(slot => <span key={slot} className={`ps-slot${slot < count ? ' ps-slot--filled' : ''}`} />)}
                  </span>
                  {isTop && <span className="ps-tag">top</span>}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="ps-column">
          <h4 className="ps-heading">Closed nodes</h4>
          {closed.length === 0
            ? <p className="ps-muted">None in this step</p>
            : <p className="ps-closed">{closed.map(node => <span key={node} className="ps-closed-chip">{node}</span>)}</p>}
          <p className="ps-need">{step.parent !== null && step.parent !== undefined && step.i > 0 ? `Needed parent: ${step.parent}` : 'Needed parent: root'}</p>
        </div>
      </div>

      <output className={`ps-verdict ps-verdict--${verdict.toLowerCase()}`} aria-label="Verdict">
        {verdict}: {step.message}
      </output>
    </section>
  )
}
