import './TwoEndsView.css'

const W = 640
const H = 230
const BASE = 185
const SCALE = 16

// Ceilings as bars. Left limits are blue ticks, right limits are orange ticks, and each room's capacity is printed above it.
export default function TwoEndsView({ run, step }) {
  const rooms = run.input.warehouse
  const slot = W / rooms.length
  const capacity = step.capacity || rooms.map((_, i) => Math.max(step.left[i] || 0, step.right[i] || 0))
  const boxes = step.sortedBoxes || [...run.input.boxes].sort((a, b) => a - b)
  return (
    <figure className="te-view">
      <div className="te-ends" aria-hidden="true"><span>← enter from left</span><span>enter from right →</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Warehouse ceilings with left and right limits">
        {rooms.map((h, i) => {
          const x = i * slot
          const current = step.index === i
          return (
            <g key={i}>
              <rect x={x + 8} y={BASE - h * SCALE} width={slot - 16} height={h * SCALE} className={current ? 'te-bar te-bar--now' : 'te-bar'} />
              {step.left[i] > 0 && <line x1={x + 8} x2={x + slot - 8} y1={BASE - step.left[i] * SCALE} y2={BASE - step.left[i] * SCALE} className="te-left" />}
              {step.right[i] > 0 && <line x1={x + 8} x2={x + slot - 8} y1={BASE - step.right[i] * SCALE - 3} y2={BASE - step.right[i] * SCALE - 3} className="te-right" />}
              <text x={x + slot / 2} y={BASE + 16} textAnchor="middle" className="te-tag">room {i}</text>
              <text x={x + slot / 2} y={20} textAnchor="middle" className="te-cap">cap {capacity[i]}</text>
            </g>
          )
        })}
        <line x1={0} x2={W} y1={BASE} y2={BASE} className="te-floor" />
      </svg>
      <div className="te-shelf" aria-label="Boxes, smallest first">
        {boxes.map((h, i) => (
          <span key={i} className={`te-box${i < (step.b ?? 0) ? ' te-box--placed' : i === step.b ? ' te-box--next' : ''}`}>{h}{i === step.b && <small> b</small>}</span>
        ))}
      </div>
      <figcaption>Blue: limit from the left. Orange: limit from the right. Placed {step.placed ?? 0}. {step.message}</figcaption>
    </figure>
  )
}
