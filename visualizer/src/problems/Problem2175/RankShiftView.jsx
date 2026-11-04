// Top: the SQL stage strip. Left: teams in their old ranking. Right: teams in the new ranking.
// Each team's old and new rank are linked, and the rank difference appears once it is computed.
export default function RankShiftView({ run, step, phases = [] }) {
  const current = Math.max(0, phases.findIndex(p => p.id === step.phase))
  const oldRows = run.frames.find(f => f.phase === 'old')?.rows ?? []
  const applied = run.frames.find(f => f.phase === 'apply')?.rows ?? []
  const newRows = run.frames.find(f => f.phase === 'new')?.rows ?? []
  const diffRows = run.frames.find(f => f.phase === 'diff')?.rows ?? []
  const showApply = ['apply', 'new', 'diff', 'done'].includes(step.phase)
  const showNew = ['new', 'diff', 'done'].includes(step.phase)
  const showDiff = ['diff', 'done'].includes(step.phase)
  const diffOf = name => diffRows.find(r => r.name === name)?.rank_diff
  const changeOf = name => applied.find(r => r.name === name)?.change ?? 0
  const pointsOf = name => applied.find(r => r.name === name)?.new_points

  const card = { border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', background: 'var(--surface2)', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', gap: 10 }
  const sign = d => (d > 0 ? `up ${d}` : d < 0 ? `down ${-d}` : 'same')

  return (
    <div aria-label="Rankings before and after the point changes" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
      <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
        {phases.map((p, i) => (
          <li key={p.id} aria-current={i === current ? 'step' : undefined} style={{
            padding: '4px 10px', borderRadius: 999, border: `1px solid ${i === current ? 'var(--primary)' : 'var(--border)'}`,
            background: i === current ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)', fontWeight: i === current ? 700 : 400,
          }}>{p.label}</li>
        ))}
      </ol>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <section aria-label="Old ranking" style={{ display: 'grid', gap: 6 }}>
          <strong>Old ranking</strong>
          {oldRows.map(row => (
            <div key={row.name} style={card}>
              <span>{row.old_rank}. {row.name}</span>
              <span>{row.points} pts{showApply && changeOf(row.name) !== 0 ? ` ${changeOf(row.name) > 0 ? '+' : ''}${changeOf(row.name)}` : ''}</span>
            </div>
          ))}
        </section>
        <section aria-label="New ranking" style={{ display: 'grid', gap: 6 }}>
          <strong>{showNew ? 'New ranking' : 'New points'}</strong>
          {(showNew ? newRows : applied).map(row => (
            <div key={row.name} style={{ ...card, borderColor: showDiff ? 'var(--primary)' : 'var(--border)' }}>
              <span>{showNew ? `${row.new_rank}. ${row.name}` : row.name}</span>
              <span>{showNew ? `${pointsOf(row.name)} pts` : `${row.new_points} pts`}{showDiff ? `, ${sign(diffOf(row.name))}` : ''}</span>
            </div>
          ))}
          {!showApply && <span style={{ color: 'var(--text-muted)' }}>Points change after the first step.</span>}
        </section>
      </div>
      <span style={{ color: 'var(--text-muted)' }}>{step.message}</span>
    </div>
  )
}
