import './ComposeView.css'

// The functions as written, left to right: fn(x) = f(g(h(x))). The value enters at the right-hand
// function, and the arrows show it moving leftward through the chain.
export default function ComposeView({ view }) {
  const fns = view.fns
  return <section className="compose-view" aria-label="Function composition">
    <ol className="compose-view__chain" role="list">
      {fns.map((name, index) => <li key={index} className={`compose-view__fn${index === view.focus ? ' compose-view__fn--current' : ''}`}>
        <span className="compose-view__name">{name}</span>
        <span className="compose-view__pos">{`position ${index + 1}`}</span>
      </li>)}
      {fns.length === 0 && <li className="compose-view__empty">No functions: the identity returns x.</li>}
    </ol>
    <p className="compose-view__flow" aria-hidden="true">{fns.length ? 'x enters on the right and moves left' : ''}</p>
    <p className="compose-view__value"><span>Value now</span> <strong>{view.value}</strong></p>
  </section>
}
