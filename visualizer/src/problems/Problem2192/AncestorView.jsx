import RecordStateTable from '../../components/shared/RecordStateTable'

// Edges as node -> children. The ancestor map lists each node's ancestors; processed nodes are marked.
export default function AncestorView({ run, step }) {
  const { n, edges } = run.input
  const rows = Array.from({ length: n }, (_, v) => ({
    node: v,
    state: step.processed?.includes(v) ? 'processed' : (step.queue ?? []).includes(v) ? 'in queue' : 'waiting',
    ancestors: (step.lists?.[v] ?? []).join(', ') || 'none',
  }))
  return (
    <div className="ancestor-view">
      <p>Edges: {edges.map(([u, v]) => `${u}→${v}`).join('  ') || 'none'}</p>
      <div className="ancestor-nodes" role="img" aria-label="Graph nodes">
        {Array.from({ length: n }, (_, v) => <div key={v} className={`anc-node${step.u === v ? ' is-current' : ''}${step.processed?.includes(v) ? ' is-done' : ''}`}>{v}</div>)}
      </div>
      <RecordStateTable label="Ancestor map: node -> ancestors" columns={['node', 'state', 'ancestors']} rows={rows} activeRow={step.u ?? -1} />
      {step.child !== undefined && <p>Latest hand-off: node {step.u} to child {step.child}.</p>}
    </div>
  )
}
