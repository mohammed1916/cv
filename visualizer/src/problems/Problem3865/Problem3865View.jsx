import './Problem3865View.css'

const CELL = 52
const PAD = 24
const TONES = ['a', 'b', 'c', 'd']

// The array is drawn as one row. Each block gets its own tinted band, and the two positions being swapped carry arrows.
export default function Problem3865View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="rk-view" aria-label="Reverse blocks">
        <p className="rk-empty">Press Play to reverse each block in place, two positions at a time.</p>
      </section>
    )
  }

  const { nums, k } = run.input
  const size = nums.length / k
  const width = PAD * 2 + nums.length * CELL
  const x = i => PAD + i * CELL + CELL / 2

  return (
    <section className="rk-view" aria-label="Reversing k blocks">
      <svg viewBox={`0 0 ${width} 150`} role="img" aria-label={`Array of ${nums.length} values split into ${k} blocks`}>
        {Array.from({ length: k }, (_, b) => (
          <g key={b} className={`rk-block rk-block--${TONES[b % TONES.length]}${step.block === b ? ' rk-block--active' : ''}`}>
            <rect x={PAD + b * size * CELL + 3} y={18} width={size * CELL - 6} height={34} rx={8} />
            <text x={PAD + b * size * CELL + (size * CELL) / 2} y={40} textAnchor="middle">block {b + 1}</text>
          </g>
        ))}
        {step.arr.map((value, i) => {
          const isLo = step.lo === i
          const isHi = step.hi === i
          const cls = isLo || isHi ? 'rk-cell rk-cell--swap' : 'rk-cell'
          return (
            <g key={i} className={cls}>
              <rect x={PAD + i * CELL + 4} y={64} width={CELL - 8} height={44} rx={8} />
              <text className="rk-value" x={x(i)} y={92} textAnchor="middle">{value}</text>
              <text className="rk-index" x={x(i)} y={126} textAnchor="middle">{i}</text>
              {isLo && <text className="rk-arrow" x={x(i)} y={150 - 2} textAnchor="middle">lo</text>}
              {isHi && <text className="rk-arrow" x={x(i)} y={150 - 2} textAnchor="middle">hi</text>}
            </g>
          )
        })}
      </svg>
      <p className="rk-message">{step.message}</p>
      <p className="rk-note">Reversing a block means swapping its outermost pair, then the next pair inward, until the middle.</p>
    </section>
  )
}
