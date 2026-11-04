// Query stage strip: one chip per clause of the query. The clause that owns the current line is highlighted.
const STAGE_LINE = /^\s*(WITH|SELECT|FROM|(LEFT |RIGHT |INNER |CROSS )?JOIN|WHERE|GROUP BY|HAVING|ORDER BY|UNION|LIMIT)\b/i

export default function SqlStages({ code = [], activeLine = null }) {
  const stages = code.filter(entry => STAGE_LINE.test(entry.text))
  const current = activeLine === null ? null : stages.filter(entry => entry.line <= activeLine).pop()?.line ?? null
  return <ol aria-label="Query stages" style={{ listStyle: 'none', padding: 0, margin: '0 0 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {stages.map(entry => {
      const active = entry.line === current
      return <li key={entry.line} aria-current={active ? 'step' : undefined} style={{
        fontFamily: 'monospace', fontSize: 13, padding: '4px 8px', borderRadius: 6, color: 'var(--text)',
        border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        background: active ? 'var(--surface2)' : 'transparent',
      }}>{entry.text.trim()}</li>
    })}
  </ol>
}
