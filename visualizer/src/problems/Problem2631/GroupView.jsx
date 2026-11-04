import './GroupView.css'

// Items in array order on the left, each tagged with its key. Groups on the right collect the items
// that produced each key. The item being read is outlined; a group that has just been created is marked.
export default function GroupView({ view }) {
  const current = view.focus >= 0 ? view.items[view.focus] : null
  return <section className="group-view" aria-label="Group by">
    <ol className="group-view__items" role="list" aria-label="Array items">
      {view.items.map((item, index) => <li key={index} className={`group-view__item${index === view.focus ? ' group-view__item--current' : ''}${index < view.focus || view.focus === -1 && view.groups.some(g => g.items.includes(item.id)) ? ' group-view__item--done' : ''}`}>
        <span>{`id ${item.id}`}</span><code>{`${view.keyName !== undefined && index === view.focus ? view.keyName : item.key}`}</code>
      </li>)}
    </ol>
    <div className="group-view__groups" aria-label="Result object">
      {view.groups.length === 0 && <p className="group-view__empty">The result object is empty.</p>}
      {view.groups.map(group => <div key={group.name} className={`group-view__group${current && current.key === group.name ? ' group-view__group--target' : ''}`}>
        <strong>{`"${group.name}"`}</strong>
        <span>{`[${group.items.join(', ')}]`}</span>
      </div>)}
    </div>
    <p className="group-view__note">{current ? `Reading item ${current.id}, key "${current.key}".` : 'Each group keeps the original items in array order.'}</p>
  </section>
}
