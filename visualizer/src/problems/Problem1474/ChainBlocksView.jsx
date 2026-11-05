import './ChainBlocksView.css'

// Linked list drawn as a chain: green nodes are kept, red nodes are deleted, the amber node is being handled.
export default function ChainBlocksView({ run, step }) {
  const { m, n } = run.input
  const cells = run.input.list
  const width = 52
  return (
    <figure className="cb-view">
      <p className="cb-legend">Keep {m}, then delete {n}, repeated.</p>
      <div className="cb-chain" role="list" aria-label="Linked list nodes">
        {cells.map((value, index) => {
          const state = step.status[index]
          const current = index === step.index
          const cls = `cb-node cb-node--${state}${current ? ' cb-node--now' : ''}`
          return (
            <div key={index} role="listitem" className="cb-item" style={{ minWidth: width }}>
              <div className={cls}>
                <span className="cb-value">{value}</span>
                <small>{state === 'keep' ? 'kept' : state === 'drop' ? 'deleted' : 'pending'}</small>
              </div>
              {current && <span className="cb-now-tag">cur</span>}
              {index < cells.length - 1 && <span className="cb-arrow" aria-hidden="true">→</span>}
            </div>
          )
        })}
        <span className="cb-null" aria-hidden="true">null</span>
      </div>
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
