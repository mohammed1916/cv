import IndexedSequence from './IndexedSequence'
import { WALK_KINDS, describeWalkStack, stackRows, treeWalk } from './treeWalkModel.js'
import './TreeWalkView.css'

/**
 * Where a tree traversal is right now: the decision at the current node, the pending call stack / explicit
 * stack / queue, and the visit order built so far. Pass the fields from treeWalkModel's `treeWalk`.
 */
export default function TreeWalkView(props) {
  const walk = treeWalk(props)
  const { rows, hidden } = stackRows(walk)
  return <section className="tree-walk" aria-label="Traversal state">
    {walk.decision && <p className="tree-walk__decision"><strong>Decision:</strong> {walk.decision}</p>}
    {walk.stack && <div className="tree-walk__pending">
      <h3>{WALK_KINDS[walk.kind].title}</h3>
      <p className="tree-walk__summary">{describeWalkStack(walk)}</p>
      {rows.length > 0 && <ol className="tree-walk__rows">
        {rows.map((row, i) => <li key={i} className={row.tag ? 'is-top' : ''}>
          <b>{row.label}</b>{row.note && <span>{row.note}</span>}{row.tag && <em>{row.tag}</em>}
        </li>)}
        {hidden > 0 && <li className="tree-walk__more">… {hidden} more below</li>}
      </ol>}
    </div>}
    <IndexedSequence label={walk.orderLabel} length={Math.max(walk.order.length, 1)} active={walk.order.length - 1}
      valueAt={i => (walk.order.length ? walk.order[i] : '-')} />
  </section>
}
