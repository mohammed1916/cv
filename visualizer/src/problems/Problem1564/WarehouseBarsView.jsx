import './WarehouseBarsView.css'

const W = 640
const H = 220
const BASE = 180
const SCALE = 16

// Room ceilings as grey bars, effective heights as blue ticks, and the sorted boxes as a shelf below.
export default function WarehouseBarsView({ run, step }) {
  const rooms = run.input.warehouse
  const slot = W / rooms.length
  const bar = (x, h) => <rect x={x + 8} y={BASE - h * SCALE} width={slot - 16} height={h * SCALE} />
  const placedBoxes = new Set()
  const boxes = step.sortedBoxes || []
  return (
    <figure className="wb-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Warehouse rooms, effective heights and boxes">
        {rooms.map((h, i) => (
          <g key={i} className={step.index === i ? 'wb-room wb-room--now' : 'wb-room'}>
            {bar(i * slot, h)}
            <line x1={i * slot + 8} x2={i * slot + slot - 8} y1={BASE - step.effective[i] * SCALE} y2={BASE - step.effective[i] * SCALE} className="wb-effective" />
            <text x={i * slot + slot / 2} y={BASE + 16} textAnchor="middle" className="wb-tag">room {i}</text>
            <text x={i * slot + slot / 2} y={BASE - h * SCALE - 6} textAnchor="middle" className="wb-tag">{h}</text>
          </g>
        ))}
        <line x1={0} x2={W} y1={BASE} y2={BASE} className="wb-floor" />
      </svg>
      <div className="wb-shelf" aria-label="Boxes, smallest first">
        {boxes.map((h, i) => (
          <span key={i} className={`wb-box${i < (step.b ?? 0) ? ' wb-box--placed' : i === step.b ? ' wb-box--next' : ''}`} style={{ height: 8 + h * 4 }}>{h}</span>
        ))}
      </div>
      <figcaption>
        Grey bars: ceilings. Blue tick: effective height (lowest ceiling from the left). Placed {step.placed ?? 0}. {step.message}
      </figcaption>
    </figure>
  )
}
