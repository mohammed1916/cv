import './PeopleSeenView.css'

const CELL = 64
const PAD = 16

const key = (r, c) => `${r},${c}`

export default function PeopleSeenView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ps-view" aria-label="People seen in a grid">
        <p className="ps-empty">Press Play to sweep each row and column with a stack.</p>
      </section>
    )
  }

  const { rows, cols, heights, answer } = run
  const width = PAD * 2 + cols * CELL
  const height = PAD * 2 + rows * CELL
  const x = c => PAD + c * CELL + CELL / 2
  const y = r => PAD + r * CELL + CELL / 2
  const current = step.cell ? key(step.cell[0], step.cell[1]) : null
  const visible = new Set((step.visible || []).map(([r, c]) => key(r, c)))
  const stackIndex = new Map((step.stack || []).map(([r, c], i) => [key(r, c), i + 1]))
  const counted = new Map((step.counted || []).map(([r, c, n]) => [key(r, c), n]))

  let band = null
  if (step.line !== null && step.line !== undefined) {
    band = step.mode === 'row'
      ? { x: PAD, y: PAD + step.line * CELL, w: cols * CELL, h: CELL }
      : { x: PAD + step.line * CELL, y: PAD, w: CELL, h: rows * CELL }
  }

  const heading = step.mode === 'row'
    ? `Row ${step.line}: looking right`
    : step.mode === 'column'
      ? `Column ${step.line}: looking down`
      : step.mode === 'done' ? 'Finished' : 'Setup'

  return (
    <section className="ps-view" aria-label="People seen in a grid">
      <header className="ps-header">
        <h3 className="ps-title">{heading}</h3>
        <p className="ps-status" role="status">
          {step.cell ? `Cell (${step.cell[0]}, ${step.cell[1]}) height ${heights[step.cell[0]][step.cell[1]]}` : 'Pick up the next line of people'}
        </p>
      </header>

      <div className="ps-stage">
        <svg className="ps-svg" viewBox={`0 0 ${width} ${height}`} role="img"
          aria-label={`${rows} by ${cols} grid. ${step.message}`}>
          {band && <rect className="ps-band" x={band.x} y={band.y} width={band.w} height={band.h} rx={8} />}

          {current && (step.visible || []).map(([r, c]) => (
            <line key={`link-${r}-${c}`} className="ps-link" x1={x(step.cell[1])} y1={y(step.cell[0])} x2={x(c)} y2={y(r)} />
          ))}

          {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
            const id = key(r, c)
            const classes = ['ps-cell']
            if (visible.has(id)) classes.push('ps-cell--seen')
            if (stackIndex.has(id)) classes.push('ps-cell--stack')
            if (id === current) classes.push('ps-cell--current')
            const pass = counted.has(id) ? ` count ${counted.get(id)} in this pass` : ''
            const stackNote = stackIndex.has(id) ? `, stack slot ${stackIndex.get(id)} from bottom` : ''
            return (
              <g key={id} className={classes.join(' ')}
                aria-label={`Row ${r}, column ${c}, height ${heights[r][c]}, answer ${answer[r][c]}${pass}${stackNote}${visible.has(id) ? ', seen from the current cell' : ''}`}>
                <rect x={PAD + c * CELL + 4} y={PAD + r * CELL + 4} width={CELL - 8} height={CELL - 8} rx={8} />
                <text x={x(c)} y={y(r) - 4} textAnchor="middle" className="ps-height">{heights[r][c]}</text>
                <text x={x(c)} y={y(r) + 16} textAnchor="middle" className="ps-answer">
                  {`ans ${answer[r][c]}`}
                  {counted.has(id) ? ` +${counted.get(id)}` : ''}
                </text>
                {stackIndex.has(id) && <text x={PAD + c * CELL + 10} y={PAD + r * CELL + 16} className="ps-slot">{`S${stackIndex.get(id)}`}</text>}
                {visible.has(id) && <text x={PAD + c * CELL + CELL - 10} y={PAD + r * CELL + 16} textAnchor="end" className="ps-seen-mark">seen</text>}
              </g>
            )
          }))}
        </svg>
      </div>

      <ol className="ps-stack" aria-label="Stack from bottom to top">
        {(step.stack || []).length === 0
          ? <li className="ps-stack-empty">Stack is empty</li>
          : (step.stack || []).map(([r, c, h], i) => <li key={key(r, c)}>{`S${i + 1}: height ${h} at (${r}, ${c})`}</li>)}
      </ol>

      <p className="ps-message" role="note">{step.message}</p>
      <ul className="ps-legend" aria-label="Legend">
        <li><span className="ps-swatch ps-swatch--band" /> line being swept</li>
        <li><span className="ps-swatch ps-swatch--current" /> current cell</li>
        <li><span className="ps-swatch ps-swatch--seen" /> seen from the current cell</li>
        <li><span className="ps-swatch ps-swatch--stack" /> waiting on the stack</li>
      </ul>
    </section>
  )
}
