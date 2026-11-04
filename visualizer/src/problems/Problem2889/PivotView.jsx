import RecordStateTable from '../../components/shared/RecordStateTable'

const tint = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, transparent)`
const cellStyle = { border: '1px solid var(--border)', padding: '6px 10px', textAlign: 'center', color: 'var(--text)', minWidth: 58 }

function Route({ row, placed }) {
  const chip = (color, label, value) => <span style={{ background: tint(color, 18), border: `1px solid ${color}`, borderRadius: 6, padding: '3px 8px', color: 'var(--text)' }}>
    <small style={{ color: 'var(--text-muted)' }}>{label} </small><strong>{value}</strong>
  </span>
  return <div data-testid="pivot-route" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: '10px 0', color: 'var(--text)' }}>
    {chip('var(--primary)', 'month picks row', row.month)}
    {chip('var(--info)', 'city picks column', row.city)}
    <span aria-hidden="true">{placed ? '=' : '→'}</span>
    {chip('var(--success)', placed ? 'cell now holds' : 'value to place', row.temperature)}
  </div>
}

// The long input on one side, the wide output on the other, and the single row travelling between them.
export default function PivotView({ run, step }) {
  const { weather } = run.input
  const { months, cities, grid, rowIndex, target, placed } = step
  const active = rowIndex >= 0 ? weather[rowIndex] : null
  const [targetRow, targetColumn] = target ?? [-1, -1]
  return <section aria-label="Pivot reshape" style={{ color: 'var(--text)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
      <RecordStateTable label="weather (long form)" columns={['city', 'month', 'temperature']} rows={weather} activeRow={rowIndex} />
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table aria-label="Pivoted table" style={{ borderCollapse: 'collapse' }}>
          <caption style={{ textAlign: 'left', fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>pivoted table (one row per month)</caption>
          <thead><tr>
            <th scope="col" style={{ ...cellStyle, background: 'var(--surface3)' }}>month</th>
            {cities.map((city, c) => <th scope="col" key={city} data-column={city} style={{ ...cellStyle, background: c === targetColumn ? tint('var(--info)', 30) : 'var(--surface3)' }}>{city}</th>)}
            {cities.length === 0 && <th scope="col" style={{ ...cellStyle, color: 'var(--text-muted)', background: 'var(--surface2)', fontWeight: 400 }}>cities pending</th>}
          </tr></thead>
          <tbody>
            {months.map((month, r) => <tr key={month}>
              <th scope="row" data-row={month} style={{ ...cellStyle, background: r === targetRow ? tint('var(--primary)', 30) : 'var(--surface3)' }}>{month}</th>
              {cities.length === 0 && <td style={{ ...cellStyle, background: 'var(--surface2)' }} />}
              {cities.map((city, c) => {
                const isTarget = r === targetRow && c === targetColumn
                const value = grid[r]?.[c] ?? null
                const crossing = r === targetRow || c === targetColumn
                return <td key={city} data-cell={`${month}|${city}`} data-target={isTarget || undefined} style={{
                  ...cellStyle,
                  background: isTarget ? tint('var(--success)', placed ? 40 : 20) : crossing && target ? 'var(--surface3)' : 'var(--surface2)',
                  outline: isTarget ? '2px solid var(--success)' : 'none', outlineOffset: -2,
                  fontWeight: isTarget ? 700 : 400,
                }}>{value ?? (step.phase === 'done' ? <span style={{ color: 'var(--text-muted)' }}>NaN</span> : isTarget ? '?' : '')}</td>
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    {active && <Route row={active} placed={placed} />}
  </section>
}
