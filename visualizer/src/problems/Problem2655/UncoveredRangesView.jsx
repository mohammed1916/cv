import './UncoveredRangesView.css'

const CELL = 34
const LEFT = 24
const ROW = 28

export default function UncoveredRangesView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ur-view" aria-label="Uncovered ranges">
        <p className="ur-empty">Press Play to sweep a cursor across the covered ranges.</p>
      </section>
    )
  }

  const { n, ranges, index, cursor, gaps, lastGap } = step
  const width = LEFT * 2 + n * CELL
  const bandTop = 30 + ranges.length * ROW + 24
  const x = c => LEFT + c * CELL
  const current = index >= 0 ? ranges[index] : null
  const covered = Array.from({ length: n }, () => false)
  ranges.forEach(([l, r]) => { for (let c = l; c <= r; c += 1) covered[c] = true })
  const gapCells = new Set()
  gaps.forEach(([l, r]) => { for (let c = l; c <= r; c += 1) gapCells.add(c) })

  return (
    <section className="ur-view" aria-label="Uncovered ranges on a line">
      <svg className="ur-svg" viewBox={`0 0 ${width} ${bandTop + 110}`} role="img"
        aria-label={`Cells 0 to ${n - 1}, with covered ranges as bars and gaps in green`}>
        {ranges.map(([l, r], i) => {
          const active = i === index
          return (
            <g key={`r-${i}`} className={active ? 'ur-bar ur-bar--active' : 'ur-bar'}>
              <rect x={x(l)} y={30 + i * ROW} width={(r - l + 1) * CELL - 4} height="20" rx="4" />
              <text x={x(l) + 6} y={44 + i * ROW}>{`[${l}, ${r}]`}</text>
            </g>
          )
        })}
        {Array.from({ length: n }, (_, c) => {
          const isCursor = c === cursor && cursor <= n - 1
          const cls = ['ur-cell', covered[c] ? 'ur-cell--covered' : '', gapCells.has(c) ? 'ur-cell--gap' : '',
            current && c >= current[0] && c <= current[1] ? 'ur-cell--looking' : ''].filter(Boolean).join(' ')
          return (
            <g key={`c-${c}`} className={cls}>
              <rect x={x(c)} y={bandTop} width={CELL - 2} height="34" rx="3" />
              <text x={x(c) + (CELL - 2) / 2} y={bandTop + 22} textAnchor="middle">{c}</text>
              <text x={x(c) + (CELL - 2) / 2} y={bandTop + 52} textAnchor="middle" className="ur-status">
                {covered[c] ? 'covered' : 'open'}
              </text>
              {isCursor && (
                <g className="ur-cursor">
                  <path d={`M ${x(c) + (CELL - 2) / 2} ${bandTop - 6} l -6 -10 h 12 z`} />
                  <text x={x(c) + (CELL - 2) / 2} y={bandTop - 14} textAnchor="middle">cursor</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <p className="ur-status-line" role="status">
        {lastGap ? `Gap [${lastGap[0]}, ${lastGap[1]}] recorded.` : `Cursor at ${cursor}.`}
      </p>
      <ol className="ur-gaps" aria-label="Gaps found so far">
        {gaps.length === 0 && <li className="ur-gap ur-gap--empty">No gap yet.</li>}
        {gaps.map(([l, r], i) => <li key={i} className="ur-gap">{`[${l}, ${r}]`}</li>)}
      </ol>
    </section>
  )
}
