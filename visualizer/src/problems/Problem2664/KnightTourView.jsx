import './KnightTourView.css'

const CELL = 58
const PAD = 26

export default function KnightTourView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="kt-view" aria-label="Knight's tour board">
        <p className="kt-empty">Press Play to watch the knight search for a tour.</p>
      </section>
    )
  }

  const { rows, cols, board, at, options, chosen, phase } = step
  const width = PAD * 2 + cols * CELL
  const height = PAD * 2 + rows * CELL
  const cx = c => PAD + c * CELL + CELL / 2
  const cy = r => PAD + r * CELL + CELL / 2
  const labelled = []
  board.forEach((row, r) => row.forEach((v, c) => { if (v >= 0) labelled.push({ v, r, c }) }))
  labelled.sort((a, b) => a.v - b.v)
  const isStart = (r, c) => r === step.start[0] && c === step.start[1]
  const atKey = at ? `${at[0]},${at[1]}` : null
  const optionKeys = new Map(options.map(o => [`${o.r},${o.c}`, o.onward]))
  const chosenKey = chosen ? `${chosen.r},${chosen.c}` : null
  const dead = phase === 'backtrack'
  const emptyResult = phase === 'done' && step.labelled !== rows * cols

  return (
    <section className="kt-view" aria-label="Knight's tour board">
      <svg className="kt-svg" viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={`${rows} by ${cols} board; labels show visit order from the start square`}>
        {labelled.slice(1).map((cell, i) => {
          const prev = labelled[i]
          return <line key={`p-${cell.v}`} className="kt-path" x1={cx(prev.c)} y1={cy(prev.r)} x2={cx(cell.c)} y2={cy(cell.r)} />
        })}
        {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (__, c) => {
          const v = board[r][c]
          const key = `${r},${c}`
          const isOption = optionKeys.has(key)
          const cls = ['kt-cell',
            (r + c) % 2 ? 'kt-cell--dark' : 'kt-cell--light',
            v >= 0 ? 'kt-cell--visited' : '',
            isStart(r, c) ? 'kt-cell--start' : '',
            key === atKey ? (dead ? 'kt-cell--dead' : 'kt-cell--current') : '',
            isOption && key !== chosenKey ? 'kt-cell--option' : '',
            key === chosenKey ? 'kt-cell--chosen' : ''].filter(Boolean).join(' ')
          return (
            <g key={key} className={cls}>
              <rect x={PAD + c * CELL} y={PAD + r * CELL} width={CELL} height={CELL} />
              {v >= 0 && <text x={cx(c)} y={cy(r) + 6} textAnchor="middle" className="kt-label">{v}</text>}
              {v < 0 && isOption && <text x={cx(c)} y={cy(r) + 4} textAnchor="middle" className="kt-onward">{`${optionKeys.get(key)} next`}</text>}
              {isStart(r, c) && <text x={cx(c)} y={PAD + r * CELL + 12} textAnchor="middle" className="kt-tag">start</text>}
            </g>
          )
        }))}
      </svg>
      <p className="kt-status" role="status">
        {step.message}
        {emptyResult ? ' The grid shows the partial search before it was cleared.' : ''}
      </p>
      <p className="kt-legend">
        Numbers are visit order. Small "next" tags show onward moves for each candidate; the highlighted candidate is the one being tried.
      </p>
    </section>
  )
}
