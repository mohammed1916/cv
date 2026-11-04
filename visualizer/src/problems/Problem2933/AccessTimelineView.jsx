import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { clock } from './algorithm'

const DAY = 1440
const LANE_W = 640
const LANE_H = 34
const LEFT = 88

// Every employee on one full-day axis, so grouping is visible as dots landing on a lane.
function DayLanes({ step }) {
  const x = minutes => LEFT + (minutes / DAY) * (LANE_W - LEFT - 10)
  const height = step.groups.length * LANE_H + 26
  return <section aria-label="Accesses across the day">
    <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>The whole day, one lane per employee</h3>
    <div style={{ overflowX: 'auto' }}>
      <svg width={LANE_W} height={height} viewBox={`0 0 ${LANE_W} ${height}`} role="img" aria-label="Access times by employee" style={{ display: 'block' }}>
        {[0, 6, 12, 18, 24].map(hour => <g key={hour}>
          <line x1={x(hour * 60)} y1={0} x2={x(hour * 60)} y2={height - 18} stroke="var(--border)" />
          <text x={x(hour * 60)} y={height - 5} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{String(hour).padStart(2, '0')}:00</text>
        </g>)}
        {step.groups.map(({ name, minutes }, laneIndex) => {
          const y = laneIndex * LANE_H + LANE_H / 2
          const isCurrent = name === step.current
          const verdict = step.verdicts[name]
          const color = verdict === true ? 'var(--success)' : verdict === false ? 'var(--text-muted)' : 'var(--primary)'
          return <g key={name} data-employee={name} data-verdict={verdict === undefined ? 'open' : verdict ? 'high' : 'not-high'}>
            {isCurrent && <rect x={0} y={y - LANE_H / 2 + 2} width={LANE_W} height={LANE_H - 4} rx="5" fill="color-mix(in srgb, var(--primary) 12%, var(--surface))" />}
            <line x1={LEFT} y1={y} x2={LANE_W - 10} y2={y} stroke="var(--border)" />
            <text x={6} y={y + 4} fontSize="12" fontWeight={isCurrent ? 700 : 400} fill="var(--text)">{name}{verdict === true ? ' ✓' : verdict === false ? ' ✗' : ''}</text>
            {minutes.map((value, i) => <circle key={i} cx={x(value)} cy={y} r="5" fill={color} stroke="var(--surface)"><title>{`${name} at ${clock(value)}`}</title></circle>)}
          </g>
        })}
      </svg>
    </div>
  </section>
}

// A close-up of one trio against a 60-minute ruler anchored at its earliest time.
function TrioLens({ step }) {
  const times = step.sorted[step.current]
  const a = times[step.i - 2], b = times[step.i - 1], c = times[step.i]
  const from = a - 10
  const to = Math.max(a + 70, c + 10)
  const width = 560
  const height = 92
  const x = minutes => 12 + ((minutes - from) / (to - from)) * (width - 24)
  const ok = step.gap < 60
  const color = ok ? 'var(--success)' : 'var(--error)'
  return <section aria-label="Three consecutive times">
    <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Close-up: does {clock(c)} fall before the hour from {clock(a)} ends?</h3>
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Gap ${step.gap} minutes against a 60 minute limit`} style={{ display: 'block' }}>
        <rect x={x(a)} y={8} width={x(a + 60) - x(a)} height={22} rx="4" fill="color-mix(in srgb, var(--success) 22%, var(--surface))" stroke="var(--success)" />
        <text x={(x(a) + x(a + 60)) / 2} y={23} textAnchor="middle" fontSize="11" fill="var(--text)">under 60 minutes from {clock(a)}</text>
        <line x1={x(a + 60)} y1={4} x2={x(a + 60)} y2={62} stroke="var(--error)" strokeWidth="2" strokeDasharray="4 3" />
        <line x1={x(from)} y1={50} x2={x(to)} y2={50} stroke="var(--border)" />
        <line x1={x(a)} y1={50} x2={x(c)} y2={50} stroke={color} strokeWidth="4" />
        {[a, b, c].map((value, index) => <circle key={index} cx={x(value)} cy={50} r="7" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />)}
        <text x={x(a)} y={78} textAnchor="middle" fontSize="11" fill="var(--text)">{clock(a)}</text>
        {c !== a && <text x={x(c)} y={78} textAnchor="middle" fontSize="11" fill="var(--text)">{clock(c)}</text>}
        <text x={width - 8} y={88} textAnchor="end" fontSize="12" fontWeight="700" fill={color}>{step.gap} min {ok ? '< 60' : '≥ 60'}</text>
      </svg>
    </div>
  </section>
}

export default function AccessTimelineView({ run, step }) {
  const rows = run.input.access_times.map(([name, stamp], i) => ({
    '#': i, name, time: stamp,
    minutes: i <= step.rowIndex || step.rowIndex < 0 && step.phase !== 'start' ? Number(stamp.slice(0, 2)) * 60 + Number(stamp.slice(2)) : '',
  }))
  const times = step.current ? step.sorted[step.current] : null
  return <section aria-label="High-access check" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <DayLanes step={step} />
    {times && <IndexedSequence label={`${step.current} sorted`} length={times.length} valueAt={i => clock(times[i])}
      active={step.i} roleAt={i => (step.i >= 0 && i >= step.i - 2 && i <= step.i ? 'window' : '')} />}
    {step.i >= 2 && <TrioLens step={step} />}
    <output aria-label="High-access employees" style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', background: 'var(--surface2)' }}>
      High-access so far: <strong>{step.answer.length ? step.answer.join(', ') : 'none'}</strong>
    </output>
    <RecordStateTable label="Access records" columns={['#', 'name', 'time', 'minutes']} rows={rows} activeRow={step.rowIndex} />
  </section>
}
