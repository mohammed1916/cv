// Each row layout is drawn as a strip of bricks; seams are the boundaries between bricks.
// The count column is the number of walls ending in that layout after the current row.
export default function WallView({ run, step }) {
  const { width } = run.input
  const layouts = step.layouts ?? []
  const seams = step.seams ?? layouts.map(() => [])
  const dp = step.dp ?? layouts.map(() => null)
  return (
    <div className="wall-view">
      <p>Width {width}. Adjacent rows must not share a seam (a vertical join), except at the two ends.</p>
      <div className="wall-rows" role="table" aria-label="Row layouts with ways">
        {layouts.map((row, j) => <div key={j} className="wall-row" role="row">
          <div className="wall-strip" role="cell" aria-label={`Layout ${row.join('+')}`}>
            {row.map((b, i) => <div key={i} className="brick" style={{ flex: b }}>{b}</div>)}
          </div>
          <span className="wall-seams" role="cell">seams {seams[j].join(', ') || 'none'}</span>
          <strong className="wall-ways" role="cell">{dp[j] === null ? '-' : dp[j]}</strong>
        </div>)}
      </div>
      <p>{step.phase === 'done' ? `Total sturdy walls: ${step.dp ? step.dp.reduce((a, b) => (a + b) % 1000000007, 0) : 0}` : step.message}</p>
    </div>
  )
}
