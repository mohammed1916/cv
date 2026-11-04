// Calendar of November 2023 with the Friday cells that the query keeps, and their totals once grouped.
const LEADING_BLANKS = new Date(Date.UTC(2023, 10, 1)).getUTCDay()
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function NovemberCalendar({ rows = [], stage = '' }) {
  const cells = [...Array(LEADING_BLANKS).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const byDate = new Map(rows.map(row => [row.purchase_date, row]))
  return <section aria-label="November 2023 calendar" style={{ margin: '12px 0' }}>
    <h3 style={{ margin: '0 0 6px' }}>November 2023</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
      {DAY_NAMES.map(name => <div key={name} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text)', opacity: 0.7 }}>{name}</div>)}
      {cells.map((day, index) => {
        if (day === null) return <div key={index} />
        const date = `2023-11-${String(day).padStart(2, '0')}`
        const isFriday = (LEADING_BLANKS + day - 1) % 7 === 5
        const row = byDate.get(date)
        const kept = stage === 'friday' || stage === 'group' || stage === 'done'
        const active = isFriday && kept
        return <div key={index} style={{
          minHeight: 50, borderRadius: 6, padding: 4, fontSize: 12, color: 'var(--text)',
          border: `1px solid ${active ? 'var(--primary)' : 'var(--surface2)'}`,
          background: active ? 'var(--surface2)' : 'transparent',
          opacity: isFriday || !kept ? 1 : 0.45,
        }}>
          <strong>{day}</strong>
          {active && <div>{row ? `Total ${row.total_amount}` : 'Friday'}</div>}
        </div>
      })}
    </div>
    <p style={{ fontSize: 13, color: 'var(--text)' }}>Weeks of the month: days 1 to 7 are week 1, days 8 to 14 are week 2, and so on.</p>
  </section>
}
