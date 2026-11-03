import './KeyboardTripView.css'

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY = 38
const PAD = 14

export default function KeyboardTripView({ run, step }) {
  if (!run || !step) return <p className="kt-empty">Press Play to move the finger across the keyboard.</p>
  const at = ([r, c]) => [PAD + c * KEY + KEY / 2, PAD + r * KEY + KEY / 2]
  const width = PAD * 2 + 10 * KEY
  const height = PAD * 2 + 3 * KEY
  const path = step.moves.map(m => at(m.to))
  const start = at([1, 0])
  const finger = step.from
  const points = [start, ...path].map(p => p.join(',')).join(' ')
  const keyClass = (r, c) => {
    if (step.phase === 'done') return ''
    if (step.to && step.to[0] === r && step.to[1] === c) return ' kt-key--target'
    if (finger[0] === r && finger[1] === c) return ' kt-key--finger'
    return ''
  }
  return (
    <section className="kt" aria-label="Keyboard with the finger path">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Keyboard rows with the route typed so far">
        {ROWS.map((row, r) => [...row].map((ch, c) => {
          const [x, y] = at([r, c])
          const used = step.moves.some(m => m.ch === ch)
          return (
            <g key={`${r}-${c}`}>
              <rect x={x - KEY / 2 + 2} y={y - KEY / 2 + 2} width={KEY - 4} height={KEY - 4} rx="6"
                className={`kt-key${used ? ' kt-key--used' : ''}${keyClass(r, c)}`} />
              <text x={x} y={y + 5} className="kt-letter">{ch}</text>
            </g>
          )
        }))}
        {path.length ? <polyline points={points} className="kt-route" /> : null}
      </svg>
      <p className="kt-typed">Typed so far: {step.moves.map(m => m.ch).join('') || '(none)'}</p>
      <output className="kt-total">Total distance: {step.total}</output>
      <p className="kt-message">{step.message}</p>
    </section>
  )
}
