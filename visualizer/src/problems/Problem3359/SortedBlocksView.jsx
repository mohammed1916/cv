import './SortedBlocksView.css'

// Cells show the grid. The left column is fixed; each row's valid run is shaded, and the counted block is outlined.
export default function SortedBlocksView({ run, step }) {
  if (!run || !step) return <section className="sb-view"><p>Press Play to scan the grid column by column.</p></section>

  const { grid, k, rows, cols } = run
  const width = step.width || []
  const inRun = (r, c) => step.left >= 0 && r < width.length && width[r] > 0 && c >= step.left && c < step.left + width[r]
  const inBlock = (r, c) => step.top >= 0 && step.smallest && r >= step.top && r <= step.bottom
    && c >= step.left && c < step.left + step.smallest
  const counted = step.phase === 'count' || step.phase === 'stop'
  const cell = 46

  return (
    <section className="sb-view" aria-label="Grid of sorted blocks">
      <table className="sb-view__grid">
        <caption>Left column {step.left >= 0 ? step.left : 'none'}, k = {k}</caption>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} className={step.row === r ? 'sb-view__row--active' : ''}>
              <th scope="row">{r}</th>
              {Array.from({ length: cols }, (_, c) => {
                const blocked = grid[r][c] > k
                const classes = [
                  'sb-view__cell',
                  blocked ? 'sb-view__cell--blocked' : '',
                  inRun(r, c) ? 'sb-view__cell--run' : '',
                  counted && inBlock(r, c) ? 'sb-view__cell--block' : '',
                  c === step.left ? 'sb-view__cell--left' : '',
                ].join(' ')
                return <td key={c} className={classes} style={{ minWidth: cell }}>{grid[r][c]}</td>
              })}
              <td className="sb-view__width">{width[r] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sb-view__legend">
        Dark cells are above k. Shaded cells are the row run from the left column. Outlined cells are the block being counted.
      </p>
      <dl className="sb-view__stats">
        <div><dt>Top to bottom</dt><dd>{step.top >= 0 ? `${step.top} to ${step.bottom}` : 'none'}</dd></div>
        <div><dt>Smallest width</dt><dd>{step.smallest ?? 'none'}</dd></div>
        <div><dt>Total</dt><dd>{step.total}</dd></div>
        <div><dt>Answer</dt><dd>{step.done ? step.result ?? step.total : 'pending'}</dd></div>
      </dl>
    </section>
  )
}
