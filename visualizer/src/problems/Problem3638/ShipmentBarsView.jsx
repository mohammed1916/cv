import RecordStateTable from '../../components/shared/RecordStateTable'

const CELL = 42
const TOP = 26
const PLOT = 150
const BOTTOM = 44

// Parcels as bars. Closed shipments sit in brackets, the open shipment carries a dashed peak line.
export default function ShipmentBarsView({ run, step }) {
  const { weight } = run.input
  const max = Math.max(...weight)
  const width = weight.length * CELL
  const height = TOP + PLOT + BOTTOM
  const barTop = value => TOP + PLOT - Math.max(6, (value / max) * PLOT)
  const shipmentOf = i => step.shipments.find(s => i >= s.from && i <= s.to)
  const fillOf = i => {
    if (i === step.at) return 'var(--primary)'
    if (shipmentOf(i)) return 'var(--success)'
    if (step.at >= 0 ? (i >= step.start && i < step.at) : (i >= step.start && step.phase === 'done')) return 'var(--warning)'
    return 'var(--surface3)'
  }
  const openTo = step.at >= 0 ? step.at : weight.length - 1
  return <section aria-label="Parcels and shipments" style={{ color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${step.count} shipments closed; peak ${step.peak}`} style={{ display: 'block' }}>
        {weight.map((value, i) => <g key={i} data-index={i}>
          <rect x={i * CELL + 4} y={barTop(value)} width={CELL - 8} height={TOP + PLOT - barTop(value)} rx="3" fill={fillOf(i)} stroke="var(--border)" />
          <text x={i * CELL + CELL / 2} y={barTop(value) - 5} textAnchor="middle" fontSize="11" fill="var(--text)">{value}</text>
          <text x={i * CELL + CELL / 2} y={TOP + PLOT + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{i}</text>
        </g>)}
        {step.peak > 0 && step.start <= openTo && <g data-peak={step.peak}>
          <line x1={step.start * CELL} x2={(openTo + 1) * CELL} y1={barTop(step.peak)} y2={barTop(step.peak)} stroke="var(--error)" strokeWidth="2" strokeDasharray="6 4" />
          <text x={step.start * CELL + 2} y={barTop(step.peak) - 16} fontSize="11" fontWeight="700" fill="var(--error)">peak {step.peak}</text>
        </g>}
        {step.shipments.map(s => <g key={s.number} data-shipment={s.number}>
          <path d={`M ${s.from * CELL + 3} ${TOP + PLOT + 20} v 6 H ${(s.to + 1) * CELL - 3} v -6`} fill="none" stroke="var(--success)" strokeWidth="2" />
          <text x={(s.from + s.to + 1) * CELL / 2} y={TOP + PLOT + 39} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)">shipment {s.number}</text>
        </g>)}
      </svg>
    </div>
    <p style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '.8rem', margin: '6px 0' }}>
      <Key color="var(--primary)" text="current parcel" />
      <Key color="var(--warning)" text="open shipment" />
      <Key color="var(--success)" text="closed shipment" />
      <strong>count = {step.count}</strong>
      <strong>peak = {step.peak || 'none'}</strong>
    </p>
    <RecordStateTable label="Closed shipments" columns={['shipment', 'parcels', 'heaviest', 'last']}
      activeRow={step.phase === 'ship' ? step.shipments.length - 1 : -1}
      rows={step.shipments.map(s => ({ shipment: s.number, parcels: `${s.from} to ${s.to}`, heaviest: s.peak, last: s.last }))} />
  </section>
}

function Key({ color, text }) {
  return <span><i style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: color, marginRight: 5, verticalAlign: -1 }} />{text}</span>
}
