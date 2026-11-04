import RecordStateTable from '../../components/shared/RecordStateTable'

const BAR = 34
const UNIT_MAX = 22
const CHART = 220
const TOP = 26
const BOTTOM = 26

const COLUMNS = ['id', 'height', 'left_peak', 'right_peak', 'level', 'water']

// A bar landscape driven by the same rows as the table: peaks appear as ticks, water fills in as it is computed.
export default function RainLandscapeView({ step }) {
  const { rows, at } = step
  const tallest = Math.max(1, ...rows.map(row => row.height))
  const unit = Math.min(UNIT_MAX, (CHART - TOP - BOTTOM) / tallest)
  const base = CHART - BOTTOM
  const Y = h => base - h * unit
  const width = Math.max(rows.length * BAR + 16, 240)
  const x = i => 8 + i * BAR
  const current = at >= 0 ? rows[at] : null
  return <section aria-label="Trapped water" style={{ color: 'var(--text)', display: 'grid', gap: 12 }}>
    {step.showChart ? <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={CHART} viewBox={`0 0 ${width} ${CHART}`} role="img" aria-label="Bars in id order with their water" style={{ display: 'block' }}>
        {current && <rect x={x(at)} y={0} width={BAR} height={CHART} fill="var(--surface2)" />}
        {rows.map((row, i) => <g key={row.id} data-id={row.id}>
          {row.water > 0 && <rect data-water={row.water} x={x(i) + 2} y={Y(row.level)} width={BAR - 4} height={row.water * unit} fill="var(--info)" fillOpacity="0.55" />}
          <rect x={x(i) + 2} y={Y(row.height)} width={BAR - 4} height={Math.max(1, row.height * unit)} fill="var(--text-muted)" />
          {row.left_peak !== undefined && <line x1={x(i) + 2} x2={x(i) + BAR - 2} y1={Y(row.left_peak)} y2={Y(row.left_peak)} stroke="var(--success)" strokeWidth="3" />}
          {row.right_peak !== undefined && <line x1={x(i) + 2} x2={x(i) + BAR - 2} y1={Y(row.right_peak) - 3} y2={Y(row.right_peak) - 3} stroke="var(--warning)" strokeWidth="3" />}
          <text x={x(i) + BAR / 2} y={Math.max(11, Y(Math.max(row.height, row.level ?? 0, row.left_peak ?? 0, row.right_peak ?? 0)) - 8)} textAnchor="middle" fontSize="11" fill="var(--text)">{row.water > 0 ? `+${row.water}` : ''}</text>
          <text x={x(i) + BAR / 2} y={base + 16} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{row.id}</text>
        </g>)}
        <line x1={x(0)} x2={x(rows.length)} y1={base} y2={base} stroke="var(--border)" strokeWidth="2" />
      </svg>
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
        <span><b style={{ color: 'var(--success)' }}>▬</b> left_peak</span>
        <span><b style={{ color: 'var(--warning)' }}>▬</b> right_peak</span>
        <span><b style={{ color: 'var(--info)' }}>■</b> water</span>
      </p>
    </div> : <p style={{ margin: 0 }}>The rows are shown as stored. Ordering by id turns them into a landscape.</p>}
    <RecordStateTable label="Heights with window columns" columns={COLUMNS} rows={rows} activeRow={at} />
    <output aria-label="Running total" style={{ fontWeight: 700 }}>total_trapped_water = {step.total}{step.phase === 'done' ? '' : ' so far'}</output>
  </section>
}
