import './CuisineHeapsView.css'

/**
 * One heap per cuisine, shown as a list in heap order: highest rating first, smaller name on ties.
 * Stale entries (a rating that has since changed) are struck through until a query skips them.
 */
export default function CuisineHeapsView({ heaps = {}, top = null, cuisine = null }) {
  const names = Object.keys(heaps)
  return <section className="cuisine-heaps" aria-label="Cuisine heaps">
    <h3>One heap per cuisine</h3>
    <p className="cuisine-heaps__rule">Order inside each heap: rating from high to low, then name from A to Z.</p>
    <div className="cuisine-heaps__grid">
      {names.map(name => <div key={name} className={`cuisine-heaps__heap${cuisine === name ? ' cuisine-heaps__heap--query' : ''}`}>
        <strong>{name}</strong>
        <ol aria-label={`${name} heap`}>
          {heaps[name].length === 0 && <li className="cuisine-heaps__empty">empty</li>}
          {heaps[name].map((entry, index) => <li key={`${entry.f}-${entry.r}-${index}`}
            data-stale={entry.stale || undefined}
            className={[
              index === 0 ? 'cuisine-heaps__top' : '',
              entry.stale ? 'cuisine-heaps__stale' : '',
              top === entry.f && cuisine === name && index === 0 ? 'cuisine-heaps__answer' : '',
            ].filter(Boolean).join(' ')}>
            {entry.f} <span>{entry.r}</span>{entry.stale ? ' (stale)' : ''}
          </li>)}
        </ol>
      </div>)}
    </div>
  </section>
}
