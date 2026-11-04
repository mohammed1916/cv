import HeapView from '../../components/shared/HeapView'
import './GridRemovalView.css'

// Each row's cells, with the values removed so far tagged by round. A row gives up its greatest remaining value
// every round, so its removed cells are its largest values in descending order. Each row's max-heap sits beside it.
export default function GridRemovalView({ grid, step }) {
  const width = grid[0].length
  const removedRound = grid.map((row, r) => {
    const tags = new Map()
    const taken = width - step.heaps[r].length
    row.map((value, c) => ({ value, c }))
      .sort((a, b) => b.value - a.value || a.c - b.c)
      .slice(0, taken)
      .forEach((cell, j) => tags.set(cell.c, j + 1))
    return tags
  })
  return <section className="grid-removal" aria-label="Rows and removals">
    <table className="grid-removal__table">
      <caption>Grid, with the round each value was removed</caption>
      <tbody>
        {grid.map((row, r) => <tr key={r} className={step.row === r ? 'grid-removal__row--current' : undefined}>
          <th scope="row">{`row ${r}`}</th>
          {row.map((value, c) => {
            const round = removedRound[r].get(c)
            return <td key={c} className={round ? 'grid-removal__cell grid-removal__cell--removed' : 'grid-removal__cell'}>
              <span>{value}</span>{round && <small>{`round ${round}`}</small>}
            </td>
          })}
        </tr>)}
      </tbody>
    </table>
    <div className="grid-removal__heaps">
      {step.heaps.map((heap, r) => <div key={r} className="grid-removal__heap">
        <HeapView items={heap} order="max" title={`Row ${r} max-heap`} />
      </div>)}
    </div>
    <p className="grid-removal__total">{`Total so far: ${step.total}`}</p>
  </section>
}
