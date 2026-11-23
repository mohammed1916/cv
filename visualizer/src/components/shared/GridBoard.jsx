import './GridBoard.css'

// Small square-cell grid. cellAt(row, col) returns { className, label, title } or nothing for an empty cell.
export default function GridBoard({ rows, cols, cellAt, label }) {
  return <div className="grid-board" role="img" aria-label={label} style={{ gridTemplateColumns: `repeat(${cols}, 34px)` }}>
    {Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const cell = cellAt(row, col) || {}
      return <div key={index} className={`grid-board__cell ${cell.className || ''}`} title={cell.title}>{cell.label ?? ''}</div>
    })}
  </div>
}
