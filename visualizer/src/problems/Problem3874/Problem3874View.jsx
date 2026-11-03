import './Problem3874View.css'

const CELL = 46
const PAD = 22
const BASE = 150

// Bars show the values. Peaks are ringed. The active peak's allowed window (its neighbours' limits and k) is shaded.
export default function Problem3874View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pk-view" aria-label="Peak windows">
        <p className="pk-empty">Press Play to find each peak and count the subarrays it alone owns.</p>
      </section>
    )
  }

  const { nums, k } = run.input
  const n = nums.length
  const maxV = Math.max(...nums, 1)
  const width = PAD * 2 + n * CELL
  const height = BASE + 56
  const cx = i => PAD + i * CELL + CELL / 2
  const barH = v => (v / maxV) * (BASE - 30)
  const isPeak = i => step.peaks.includes(i)

  return (
    <section className="pk-view" aria-label="Valid subarrays around peaks">
      <p className="pk-rule">A subarray counts when its only peak sits within {k} steps of both ends.</p>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Bars for ${n} values with ${step.peaks.length} peaks`}>
        {step.left !== null && (
          <rect className="pk-window" x={cx(step.left) - CELL / 2 + 2} y={8} width={(step.right - step.left + 1) * CELL - 4} height={BASE + 4} rx={8} />
        )}
        {step.prev >= 0 && <line className="pk-wall" x1={cx(step.prev) + CELL / 2} x2={cx(step.prev) + CELL / 2} y1={6} y2={BASE + 8} />}
        {step.next < n && <line className="pk-wall" x1={cx(step.next) - CELL / 2} x2={cx(step.next) - CELL / 2} y1={6} y2={BASE + 8} />}
        {nums.map((v, i) => {
          const cls = i === step.cur ? 'pk-bar pk-bar--cur' : isPeak(i) ? 'pk-bar pk-bar--peak' : 'pk-bar'
          return (
            <g key={i} className={cls}>
              <rect x={cx(i) - 14} y={BASE - barH(v)} width={28} height={barH(v)} rx={4} />
              <text className="pk-val" x={cx(i)} y={BASE - barH(v) - 6} textAnchor="middle">{v}</text>
              <text className="pk-idx" x={cx(i)} y={BASE + 20} textAnchor="middle">{i}</text>
              {isPeak(i) && <text className="pk-tag" x={cx(i)} y={BASE + 40} textAnchor="middle">peak</text>}
            </g>
          )
        })}
      </svg>
      <p className="pk-message">{step.message}</p>
      <p className="pk-total">{step.count ? `+${step.count} this peak` : ''} Running total: {step.total}</p>
    </section>
  )
}
