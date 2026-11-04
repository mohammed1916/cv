import './FoldView.css'

// The accumulator as a box, with the array as a row of cells. The current element is outlined and the
// reducer formula for this step is shown with the before and after values.
export default function FoldView({ view }) {
  return <section className="fold-view" aria-label="Reduce fold">
    <div className="fold-view__cells" role="list">
      {view.nums.map((value, index) => {
        const done = view.done || view.focus > index
        return <span key={index} role="listitem" className={`fold-view__cell${index === view.focus ? ' fold-view__cell--current' : ''}${done ? ' fold-view__cell--done' : ''}`}>
          <small>{`[${index}]`}</small><strong>{value}</strong>
        </span>
      })}
    </div>
    <div className="fold-view__state">
      <div className="fold-view__box">
        <span>Accumulator</span>
        <strong>{view.done ? view.accum : (view.after ?? view.before ?? view.accum)}</strong>
      </div>
      <p className="fold-view__formula">{view.focus >= 0 && !view.done
        ? `${view.before ?? view.accum} + ${view.nums[view.focus]}${view.formula.includes('*') ? ` (squared: ${view.nums[view.focus] * view.nums[view.focus]})` : ''} = ${view.after ?? '...'}`
        : `Reducer: ${view.formula}`}</p>
    </div>
  </section>
}
