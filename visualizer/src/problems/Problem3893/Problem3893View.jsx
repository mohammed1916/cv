import './Problem3893View.css'

const SCALE = 30
const LEFT = 52
const ROW = 30
const MAX = 20

// Intervals are drawn as bars on a shared number line, one row each. The centre is outlined, the members it
// overlaps are filled, and the one being checked is labelled.
export default function Problem3893View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="tm-view" aria-label="Interval team">
        <p className="tm-empty">Press Play to try each interval as the centre of a team.</p>
      </section>
    )
  }

  const { intervals } = run.input
  const n = intervals.length
  const width = LEFT + (MAX + 1) * SCALE + 16
  const height = 26 + n * ROW + 24
  const x = v => LEFT + v * SCALE

  return (
    <section className="tm-view" aria-label="Closed intervals and the centre's team">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${n} intervals on a number line`}>
        {Array.from({ length: MAX + 1 }, (_, v) => v).filter(v => v % 2 === 0).map(v => (
          <g key={v}>
            <line className="tm-grid" x1={x(v)} x2={x(v)} y1={18} y2={height - 26} />
            <text className="tm-tick" x={x(v)} y={height - 8} textAnchor="middle">{v}</text>
          </g>
        ))}
        {intervals.map(([a, b], i) => {
          const isCentre = step.centre === i
          const isTeam = step.team.includes(i)
          const isBest = step.bestTeam.includes(i) && !isCentre
          const isOther = step.other === i
          const cls = ['tm-bar', isCentre ? 'tm-bar--centre' : '', isTeam ? 'tm-bar--team' : '', isOther ? 'tm-bar--other' : '', !isCentre && !isTeam && isBest ? 'tm-bar--best' : ''].filter(Boolean).join(' ')
          const y = 26 + i * ROW
          return (
            <g key={i} className={cls}>
              <text className="tm-label" x={6} y={y + 14}>{i}</text>
              <rect x={x(a)} y={y + 4} width={(b - a) * SCALE + SCALE * 0.6} height={16} rx={6} />
              <text className="tm-range" x={x(b) + SCALE * 0.8} y={y + 16}>[{a}, {b}]</text>
            </g>
          )
        })}
      </svg>
      <p className="tm-message">{step.message}</p>
      <p className="tm-total">Team around centre {step.centre >= 0 ? step.centre : '-'}: {step.size} member{step.size === 1 ? '' : 's'}. Best: {step.best}.</p>
      <ul className="tm-legend">
        <li><span className="tm-swatch tm-swatch--centre" /> centre</li>
        <li><span className="tm-swatch tm-swatch--team" /> overlaps the centre</li>
        <li><span className="tm-swatch tm-swatch--other" /> being checked</li>
        <li><span className="tm-swatch tm-swatch--best" /> best team so far</li>
      </ul>
    </section>
  )
}
