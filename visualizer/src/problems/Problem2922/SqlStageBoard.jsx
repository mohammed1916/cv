// Shows each SQL stage as a chip in a pipeline, with the table produced at the active stage.
// stages: [{ id, clause, label, columns, rows, marks? }] where marks[i] is an optional short tag for row i.
export default function SqlStageBoard({ stages, active = 0, title = 'Query stages' }) {
  const stage = stages[Math.max(0, Math.min(active, stages.length - 1))]
  const columns = stage.columns ?? (stage.rows[0] ? Object.keys(stage.rows[0]) : [])
  return <section aria-label={title} style={{ display: 'grid', gap: 8 }}>
    <ol aria-label="Pipeline" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 0, margin: 0, listStyle: 'none' }}>
      {stages.map((s, i) => <li key={s.id} data-active={i === active} aria-current={i === active ? 'step' : undefined}
        style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border, currentColor)', fontWeight: i === active ? 700 : 400,
          background: i === active ? 'var(--primary)' : i < active ? 'var(--surface2)' : 'transparent', color: i === active ? '#fff' : 'var(--text)' }}>
        <code>{s.clause}</code> <span>{s.label}</span> <small>({s.rows.length} rows)</small>
      </li>)}
    </ol>
    {stage.rows.length === 0 ? <p style={{ color: 'var(--text)' }}>No rows at this stage.</p> : <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', color: 'var(--text)', width: '100%' }}>
        <thead><tr>{columns.map(c => <th key={c} scope="col" style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '2px solid var(--border, currentColor)' }}>{c}</th>)}{stage.marks && <th scope="col">note</th>}</tr></thead>
        <tbody>{stage.rows.map((row, r) => <tr key={r} style={{ background: stage.marks?.[r]?.startsWith('kept') ? 'var(--surface2)' : 'transparent', opacity: stage.marks?.[r]?.startsWith('dropped') ? 0.55 : 1 }}>
          {columns.map(c => <td key={c} style={{ padding: '4px 8px', borderBottom: '1px solid var(--surface2)' }}>{String(row[c] ?? '')}</td>)}
          {stage.marks && <td style={{ padding: '4px 8px' }}>{stage.marks[r] ?? ''}</td>}
        </tr>)}</tbody>
      </table>
    </div>}
  </section>
}
