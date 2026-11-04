import './CurryView.css'

// The curried function as a row of argument slots. Each call adds its arguments to the slots; the
// function fires once every slot is filled, and that call's answer is the sum.
export default function CurryView({ view }) {
  const slots = Array.from({ length: Math.max(view.arity, view.collected.length) }, (_, index) => view.collected[index])
  const fired = view.focus === 0 && view.summary !== 'pending' && view.rows.length === 1 && view.title === 'Result'
  return <section className="curry-view" aria-label="Curry argument slots">
    <p className="curry-view__head">{`Needs ${view.arity} argument${view.arity === 1 ? '' : 's'}; ${view.collected.length} collected.`}</p>
    <div className="curry-view__slots" role="list">
      {slots.map((value, index) => <span key={index} role="listitem" className={`curry-view__slot${value === undefined ? ' curry-view__slot--empty' : ' curry-view__slot--filled'}`}>
        {value === undefined ? `slot ${index + 1}` : value}
      </span>)}
    </div>
    <ol className="curry-view__calls" role="list">
      {view.calls.map((args, index) => <li key={index} className={`curry-view__call${index === view.focus ? ' curry-view__call--current' : ''}`}>
        <code>{`(${args.join(', ')})`}</code>
      </li>)}
    </ol>
    <p className="curry-view__note">{fired ? `Enough arguments: fn runs and returns ${view.summary}.` : view.summary === 'pending' ? 'Calls ran out before the function fired; it is still waiting.' : 'Waiting for more arguments returns another function.'}</p>
  </section>
}
