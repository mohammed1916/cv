import './ChainView.css'

// The prototype chain as linked class boxes, nearest first. The box under the walk is outlined;
// the target class is marked so the match can be seen without reading the message.
export default function ChainView({ view }) {
  if (view.primitive) {
    return <section className="chain-view" aria-label="Prototype chain">
      <p className="chain-view__note">A primitive value has no prototype chain, so the walk never starts.</p>
    </section>
  }
  return <section className="chain-view" aria-label="Prototype chain">
    <p className="chain-view__note">Looking for <strong>{view.target}</strong> in the chain of the object.</p>
    <ol className="chain-view__chain" role="list">
      {view.chain.map((name, index) => {
        const current = index === view.focus
        const match = name === view.target
        return <li key={index} className={`chain-view__link${current ? ' chain-view__link--current' : ''}${match ? ' chain-view__link--match' : ''}`}>
          <span className="chain-view__name">{name}</span>
          <span className="chain-view__tag">{match ? 'target' : index === 0 ? 'nearest' : ''}</span>
        </li>
      })}
    </ol>
    <p className="chain-view__note">{view.summary ? `Answer: ${view.summary}` : 'The walk moves one prototype at a time, toward Object.'}</p>
  </section>
}
