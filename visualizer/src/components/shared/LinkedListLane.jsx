import './LinkedListLane.css'

/**
 * Horizontal singly linked list with named pointers and an optional cycle.
 *
 * nodes:    [{ id, value }] in list order; `id` is stable across frames.
 * pointers: [{ label, id, tone? }] placed above the node with that id.
 * roles:    { [id]: 'visited' | 'removed' | 'match' | 'active' } for node styling.
 * cycleTo:  id of the node the tail points back to, or null.
 */
export default function LinkedListLane({ title = 'Linked list', nodes = [], pointers = [], roles = {}, cycleTo = null, note }) {
  const cycleIndex = cycleTo === null ? -1 : nodes.findIndex(node => node.id === cycleTo)
  return <section className="linked-list-lane" aria-label={title}>
    <header><strong>{title}</strong>{note && <span>{note}</span>}</header>
    {nodes.length === 0 ? <em>empty list</em> : <div className="linked-list-lane__track">
      {nodes.map((node, index) => {
        const tags = pointers.filter(pointer => pointer.id === node.id)
        const role = roles[node.id] || ''
        return <div className="linked-list-lane__item" key={node.id}>
          <div className="linked-list-lane__tags">{tags.map(tag => <b key={tag.label} data-tone={tag.tone || 'primary'}>{tag.label}</b>)}</div>
          <div className={`linked-list-lane__node ${role ? 'is-' + role : ''}`} data-role={role || undefined} aria-label={`node ${node.value}`}>
            <small>{index}</small><strong>{String(node.value)}</strong>
          </div>
          {index < nodes.length - 1 ? <span className="linked-list-lane__arrow" aria-hidden="true">→</span> : null}
        </div>
      })}
      {cycleIndex >= 0 && <span className="linked-list-lane__cycle">tail → node {cycleIndex}</span>}
      {cycleIndex < 0 && nodes.length > 0 && <span className="linked-list-lane__end">null</span>}
    </div>}
  </section>
}
