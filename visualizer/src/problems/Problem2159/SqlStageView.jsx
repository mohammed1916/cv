// Shows the SQL stages as a strip, with the active stage marked, and the rows that stage produces.
export default function SqlStageView({ phases = [], step, columns = [], rows = [] }) {
  const current = Math.max(0, phases.findIndex(p => p.id === step.phase))
  return (
    <div className="sql-stage-view" aria-label="SQL stages and rows" style={{ display: 'grid', gap: 10, color: 'var(--text)' }}>
      <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
        {phases.map((p, i) => (
          <li key={p.id} aria-current={i === current ? 'step' : undefined} style={{
            padding: '4px 10px', borderRadius: 999, border: `1px solid ${i === current ? 'var(--primary)' : 'var(--border)'}`,
            background: i === current ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)', fontWeight: i === current ? 700 : 400,
          }}>{p.label}</li>
        ))}
      </ol>
      {rows.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No rows at this stage.</span>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', background: 'var(--surface2)', color: 'var(--text)', minWidth: 96 }}>
            {columns.map(column => (
              <div key={column}><small style={{ color: 'var(--text-muted)' }}>{column}</small> <strong>{String(row[column] ?? '')}</strong></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
