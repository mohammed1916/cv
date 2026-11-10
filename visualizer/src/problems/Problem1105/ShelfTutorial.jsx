import './ShelfTutorial.css'

// Directed view: only the prefix costs and books named by the scene. The dependency is shown as two
// labelled cells (the cost read and the cost written), not as arrows across the whole table.
export default function ShelfTutorial({ scene, step }) {
  const { focus } = scene
  const dp = step.snapshot.dp
  const books = step.snapshot.books
  const width = step.snapshot.width ?? null
  const limit = step.snapshot.shelfWidth
  const role = index => index === focus.target ? 'target' : index === focus.source ? 'source' : ''
  const shelfShare = width === null ? 0 : Math.min(100, Math.round((width / limit) * 100))
  return <section className="shelf-tv" aria-label="Shelf partition focus">
    <div className="shelf-tv__cells" aria-label="Prefix costs in this operation">
      {focus.cells.map(index => <div key={index} className={`shelf-tv__cell ${role(index) ? `is-${role(index)}` : ''}`} data-cell={index} data-role={role(index) || undefined}>
        <span>{role(index) === 'target' ? 'dp[' + index + '] being filled' : role(index) === 'source' ? 'dp[' + index + '] read' : 'dp[' + index + ']'}</span>
        <strong>{dp[index] ?? 'unsolved'}</strong>
      </div>)}
    </div>
    {focus.books.length > 0 && <div className="shelf-tv__shelf" aria-label={`Last shelf holds books ${focus.books[0]} to ${focus.books.at(-1)}`}>
      <div className="shelf-tv__books">
        {focus.books.map(book => <span key={book} className={`shelf-tv__book ${focus.overflow && book === focus.books[0] ? 'is-over' : ''}`} data-book={book}>
          <b>{book}</b>{books[book - 1][0]} wide, {books[book - 1][1]} tall
        </span>)}
      </div>
      {width !== null && <div className="shelf-tv__gauge" role="img" aria-label={`Width ${width} of ${limit}`}>
        <span style={{ width: `${shelfShare}%` }} className={focus.overflow ? 'is-over' : ''} />
        <em>width {width} / {limit}</em>
      </div>}
    </div>}
    <p className="shelf-tv__note">{focus.hiddenCells} other prefix costs and {focus.hiddenBooks} other books are outside this view.</p>
  </section>
}
