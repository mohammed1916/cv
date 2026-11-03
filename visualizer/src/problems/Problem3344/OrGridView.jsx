import './OrGridView.css'

// The grid holds j OR k for every pair in the size being tested; the newest row and column are highlighted.
export default function OrGridView({ run, step }) {
  if (!run || !step) return <section className="og-view"><p>Press Play to grow the cube one layer at a time.</p></section>

  const { s } = run
  const size = step.next ?? step.n
  const newest = size - 1
  const total = step.total
  const percent = total == null ? 0 : Math.min(100, Math.round((total / Math.max(1, s)) * 100))
  const over = total != null && total > s
  const rows = Array.from({ length: size }, (_, j) => Array.from({ length: size }, (_, k) => j | k))

  return (
    <section className="og-view" aria-label="Bitwise OR grid for the current size">
      <p className="og-view__caption">Layer values j OR k for size {size}, with the new row and column marked.</p>
      <table className="og-view__grid">
        <tbody>
          {rows.map((row, j) => (
            <tr key={j}>
              {row.map((value, k) => (
                <td key={k} className={j === newest || k === newest ? 'og-view__new' : ''}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="og-view__gauge" role="img" aria-label={`Total ${total ?? 0} against limit ${s}`}>
        <div className={over ? 'og-view__fill og-view__fill--over' : 'og-view__fill'} style={{ width: `${percent}%` }} />
      </div>
      <dl className="og-view__stats">
        <div><dt>Limit s</dt><dd>{s}</dd></div>
        <div><dt>Size tested</dt><dd>{size}</dd></div>
        <div><dt>Total for size</dt><dd>{total ?? 'pending'}</dd></div>
        <div><dt>Answer</dt><dd>{step.result ?? step.n}</dd></div>
      </dl>
    </section>
  )
}
