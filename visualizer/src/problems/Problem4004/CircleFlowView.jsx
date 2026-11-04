import SvgViewport from '../../components/shared/SvgViewport'

const SIZE = 460
const MID = SIZE / 2
const RING = 150
const NODE = 28

const angleOf = (i, n, shift = 0) => ((i + shift) * 2 * Math.PI) / n - Math.PI / 2
const point = (angle, radius = RING) => ({ x: MID + radius * Math.cos(angle), y: MID + radius * Math.sin(angle) })

function Arrow({ at, angle, way, fill }) {
  const heading = angle + (way > 0 ? Math.PI / 2 : -Math.PI / 2)
  const deg = (heading * 180) / Math.PI
  return <polygon points="-8,-6 8,0 -8,6" fill={fill} transform={`translate(${at.x} ${at.y}) rotate(${deg})`} />
}

function Edge({ i, n, net, step }) {
  const a = point(angleOf(i, n)), b = point(angleOf(i + 1, n))
  const middle = angleOf(i, n, 0.5)
  const routeStep = step.route.find(r => r.edge === i)
  const carrying = net !== 0
  const stroke = routeStep ? (routeStep.undo ? 'var(--warning)' : 'var(--primary)') : carrying ? 'var(--success)' : 'var(--border)'
  return <g data-edge={i} data-net={net} data-route={routeStep ? (routeStep.undo ? 'undo' : 'go') : undefined}>
    <path d={`M ${a.x} ${a.y} A ${RING} ${RING} 0 0 1 ${b.x} ${b.y}`} fill="none" stroke={stroke} strokeWidth={routeStep ? 5 : carrying ? 4 : 2} strokeDasharray={routeStep?.undo ? '8 5' : undefined} />
    {carrying && <Arrow at={point(angleOf(i, n, 0.5))} angle={middle} way={Math.sign(net)} fill="var(--success)" />}
    {routeStep && <Arrow at={point(angleOf(i, n, 0.3))} angle={angleOf(i, n, 0.3)} way={routeStep.way} fill={routeStep.undo ? 'var(--warning)' : 'var(--primary)'} />}
    {carrying && <text {...textAt(point(middle, RING - 24))} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">{Math.abs(net)}</text>}
  </g>
}
const textAt = ({ x, y }) => ({ x, y: y + 5 })

function Person({ i, n, step }) {
  const angle = angleOf(i, n)
  const at = point(angle)
  const out = point(angle, RING + 52)
  const value = step.now[i]
  const fill = value < 0 ? 'var(--error-glow)' : step.supply[i] > 0 ? 'var(--success-glow)' : 'var(--surface2)'
  const isCurrent = step.u === i
  const updated = step.updated.includes(i)
  const endpoint = step.from === i || step.to === i
  const note = step.need[i] > 0 ? `needs ${step.need[i]}` : step.supply[i] > 0 ? `spare ${step.supply[i]}` : 'settled'
  const d = step.dist?.[i]
  return <g data-person={i} data-value={value}>
    <circle cx={at.x} cy={at.y} r={NODE} fill="var(--surface)" />
    <circle cx={at.x} cy={at.y} r={NODE} fill={fill} stroke={isCurrent || endpoint ? 'var(--primary)' : updated ? 'var(--warning)' : 'var(--text-muted)'} strokeWidth={isCurrent || endpoint || updated ? 4 : 1.5} />
    <text x={at.x} y={at.y + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">{value}</text>
    <text x={out.x} y={out.y - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">person {i}</text>
    <text x={out.x} y={out.y + 3} textAnchor="middle" fontSize="12" fill="var(--text-muted)">{note}</text>
    {step.dist && <text x={out.x} y={out.y + 18} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--primary)">{d === Infinity ? 'price ∞' : `price ${d}`}</text>}
  </g>
}

// The circle itself. Circles show current balances, arcs show how many units cross each edge and which way.
export default function CircleFlowView({ step }) {
  const n = step.n
  const legend = [['var(--primary)', 'route being priced'], ['var(--warning)', 'route undoing earlier units'], ['var(--success)', 'units crossing now']]
  return <section aria-label="Circle of people" style={{ color: 'var(--text)', display: 'grid', gap: 8 }}>
    <SvgViewport width={SIZE} height={SIZE}>
      {n >= 2 && step.net.map((net, i) => <Edge key={i} i={i} n={n} net={net} step={step} />)}
      {n === 1 && <circle cx={MID} cy={MID} r={RING} fill="none" stroke="var(--border)" strokeDasharray="4 6" />}
      {step.now.map((_, i) => <Person key={i} i={i} n={n} step={step} />)}
      <text x={MID} y={MID - 8} textAnchor="middle" fontSize="15" fill="var(--text-muted)">moves</text>
      <text x={MID} y={MID + 20} textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--text)">{step.impossible ? '-1' : step.moves}</text>
    </SvgViewport>
    <p style={{ margin: 0 }}>Queue: {step.queue.length ? step.queue.map(i => `person ${i}`).join(', ') : 'empty'} · Total balance: {step.total}</p>
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
      {legend.map(([color, text]) => <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span aria-hidden="true" style={{ width: 18, height: 4, background: color, display: 'inline-block' }} />{text}</li>)}
    </ul>
  </section>
}
