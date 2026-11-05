import './SubtreeChipsView.css'

// The subtree's costs in ascending order. The chosen triple is outlined: either the three largest,
// or the two smallest with the largest (two negatives can make a positive product).
export default function SubtreeChipsView({ values, pick, best }) {
  const m = values.length
  const chosen = pick === 'top3' ? [m - 3, m - 2, m - 1] : [0, 1, m - 1]
  return (
    <figure className="sc-view">
      <div className="sc-row" aria-label="Subtree costs in ascending order">
        {values.map((v, i) => (
          <span key={i} className={chosen.includes(i) ? 'sc-chip sc-chip--picked' : v < 0 ? 'sc-chip sc-chip--neg' : 'sc-chip'}>{v}</span>
        ))}
      </div>
      <figcaption>
        Sorted subtree costs. {pick === 'top3' ? 'Three largest' : 'Two smallest and the largest'} give the best product {best}.
      </figcaption>
    </figure>
  )
}
