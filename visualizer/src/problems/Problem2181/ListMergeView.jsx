// The input list is drawn as a chain of nodes. The running sum builds in the current run; each zero emits one merged node.
export default function ListMergeView({ run, step }) {
  const { nodes } = run.input
  return (
    <div className="list-merge-view">
      <div className="node-chain" role="img" aria-label={`List ${nodes.join(' to ')}`}>
        {nodes.map((value, i) => <div key={i} className="node-wrap">
          <div className={`list-node${i === step.index ? ' is-current' : ''}${value === 0 ? ' is-zero' : ''}`}>
            <strong>{value}</strong><small>{i === 0 ? 'head' : `node ${i}`}</small>
          </div>
          {i < nodes.length - 1 && <span className="node-arrow" aria-hidden="true">→</span>}
        </div>)}
      </div>
      <p>Running sum: <strong>{step.running}</strong></p>
      <div className="merged-chain" aria-label="Merged list">
        <span>Merged:</span>
        {step.result.length === 0 && <em>empty so far</em>}
        {step.result.map((sum, i) => <div key={i} className="list-node is-merged"><strong>{sum}</strong></div>)}
      </div>
    </div>
  )
}
