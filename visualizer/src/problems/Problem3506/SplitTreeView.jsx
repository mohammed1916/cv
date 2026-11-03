import './SplitTreeView.css'

// The pool as a row of entries, and the split tree built so far. Leaves are strains; each internal node is a split that finishes at max(children) + splitTime.
function Node({ id, nodesById, merged }) {
  const node = nodesById.get(id)
  const cls = ['split-node', node.leaf ? 'split-node--leaf' : 'split-node--split', merged && (merged.a === id || merged.b === id) ? 'split-node--merging' : '', merged && merged.created === id ? 'split-node--new' : ''].join(' ')
  return (
    <li className="split-item">
      <span className={cls}>{node.leaf ? `strain ${id + 1}: ${node.value}` : `split: ${node.value}`}</span>
      {!node.leaf && (
        <ul className="split-children">
          {node.children.map(child => <Node key={child} id={child} nodesById={nodesById} merged={merged} />)}
        </ul>
      )}
    </li>
  )
}

export default function SplitTreeView({ run, step }) {
  if (!run || !step) return <section className="split-view"><p className="split-empty">Press Play to merge the two cheapest entries at a time.</p></section>
  const { splitTime } = run.input
  const nodesById = new Map(step.nodes.map(n => [n.id, n]))
  const roots = step.pool.map(p => p.id)
  const inPool = new Set(step.pool.map(p => p.id))
  // Roots: entries still in the pool. Each one is drawn as a tree of its splits.
  return (
    <section className="split-view" aria-label="Split tree of strains">
      <div className="split-pool" aria-label="Pool of entries">
        <span className="split-label">pool (min-heap)</span>
        {step.pool.map(p => (
          <span key={p.id} className={`split-entry${step.a && step.a.id === p.id ? ' split-entry--out' : ''}${step.created === p.id ? ' split-entry--new' : ''}`}>{p.value}</span>
        ))}
        {step.pool.length === 0 && <span className="split-none">empty</span>}
      </div>
      <p className="split-rule">Each split adds splitTime {splitTime} on top of the slower child.</p>
      <ul className="split-forest" aria-label="Split trees">
        {roots.filter(id => inPool.has(id)).map(id => (
          <Node key={id} id={id} nodesById={nodesById} merged={step} />
        ))}
      </ul>
      <p className="split-summary">{step.message}</p>
    </section>
  )
}
