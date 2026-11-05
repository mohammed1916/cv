import './WarehouseBarsView.css'

const W = 640
const H = 230
const BASE = 180
const SCALE = 14

// Rooms as bars (grey: ceiling), the effective height as a blue tick (lowest ceiling from the entrance),
// the current room outlined, and the sorted boxes as a shelf: placed boxes are solid, the next box is outlined.
export default function WarehouseBarsView({ warehouse, effective, room, sortedBoxes, placed, box }) {
  const slot = W / warehouse.length
  return (
    <figure className="wb-view">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Warehouse rooms, effective heights and boxes">
        {warehouse.map((h, i) => {
          const x = i * slot
          return (
            <g key={i} className={i === room ? 'wb-room wb-room--now' : 'wb-room'}>
              <rect x={x + 8} y={BASE - h * SCALE} width={slot - 16} height={h * SCALE} className="wb-bar" />
              <line x1={x + 8} x2={x + slot - 8} y1={BASE - effective[i] * SCALE} y2={BASE - effective[i] * SCALE} className="wb-effective" />
              <text x={x + slot / 2} y={BASE + 16} textAnchor="middle" className="wb-tag">room {i}</text>
              <text x={x + slot / 2} y={BASE - h * SCALE - 6} textAnchor="middle" className="wb-tag">{h}</text>
            </g>
          )
        })}
        <line x1={0} x2={W} y1={BASE} y2={BASE} className="wb-floor" />
      </svg>
      <div className="wb-shelf" aria-label="Boxes, smallest first">
        {sortedBoxes.map((h, i) => (
          <span key={i} className={`wb-box${i < placed ? ' wb-box--placed' : i === placed && box !== undefined ? ' wb-box--next' : ''}`} style={{ height: 8 + h * 4 }}>{h}</span>
        ))}
      </div>
    </figure>
  )
}
