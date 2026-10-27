import { describeLinkRewrites, groupPointers, listNodeLabel, walkList } from './listPointerModel.js'
import './ListPointerView.css'

const valueMap = (...lists) => new Map(lists.flat().map(node => [node.id, node.val ?? node.value]))

/**
 * Pointer-level view of a linked list: every node with its next (and optional prev) link, named pointers
 * (prev/cur/next, slow/fast, dummy/tail) above the node they hold, nodes cut off from the head, and the next
 * pointers rewritten since the previous step.
 *
 * nodes:     reachable nodes in list order [{ id, val, nextId, prevId? }]
 * pointers:  [{ label, nodeId }]  (nodeId null = the pointer is null)
 * detached:  nodes no longer reachable from the head [{ id, val, nextId }]
 * rewrites:  [{ field: 'next' | 'head', id, from, to }]
 */
export default function ListPointerView({ title = 'Linked list pointers', nodes = [], pointers = [], highlightedIds = [], detached = [], rewrites = [], doubly = false }) {
  const values = valueMap(nodes, detached)
  const groups = groupPointers(pointers)
  const lines = describeLinkRewrites(rewrites, id => values.get(id))
  const nexts = Object.fromEntries(nodes.map(node => [node.id, node.nextId ?? null]))
  const cycleTo = nodes.length ? walkList(nexts, nodes[0].id).cycleTo : null
  const hot = new Set(highlightedIds.map(String))
  const renderNode = (node, index, isDetached) => <li key={node.id} className={`list-pointer-view__node${hot.has(String(node.id)) ? ' is-hot' : ''}${isDetached ? ' is-detached' : ''}`}>
    <span className="list-pointer-view__tags">{(groups.get(node.id) ?? []).map(label => <b key={label}>{label}</b>)}</span>
    <span className="list-pointer-view__box"><small>#{node.id}</small><strong>{String(node.val)}</strong></span>
    <span className="list-pointer-view__next">next → {node.nextId === null || node.nextId === undefined ? 'null' : `#${node.nextId}`}</span>
    {doubly && <span className="list-pointer-view__prev">prev ← {node.prevId === null || node.prevId === undefined ? 'null' : `#${node.prevId}`}</span>}
    {!isDetached && index < nodes.length - 1 && <span className="list-pointer-view__arrow" aria-hidden="true">→</span>}
  </li>
  return <section className="list-pointer-view" aria-label={title}>
    <h3>{title}</h3>
    {lines.length > 0 && <ol className="list-pointer-view__rewrites" aria-label="Pointers rewritten this step">{lines.map((line, i) => <li key={i}>{line}</li>)}</ol>}
    {nodes.length === 0 ? <p className="list-pointer-view__empty">head → null (empty list)</p> : <ol className="list-pointer-view__chain" aria-label="Nodes from head">
      {nodes.map((node, index) => renderNode(node, index, false))}
      <li className="list-pointer-view__end">{cycleTo === null ? <><span className="list-pointer-view__tags">{(groups.get(null) ?? []).map(label => <b key={label}>{label}</b>)}</span><span className="list-pointer-view__null">null</span></> : <span className="list-pointer-view__null">back to {listNodeLabel(cycleTo)}</span>}</li>
    </ol>}
    {detached.length > 0 && <div className="list-pointer-view__detached"><h4>Detached (not reachable from head)</h4>
      <ol>{detached.map((node, index) => renderNode(node, index, true))}</ol></div>}
  </section>
}
