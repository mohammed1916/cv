// Top: the SQL stage strip. Middle: one player's matches in day order as chips.
// A win adds to the run; a draw or loss ends it. The chip with the longest run is marked.
const LETTER = { Win: 'W', Draw: 'D', Lose: 'L' }

const chipStyle = (active, won) => ({
  display: 'inline-grid', justifyItems: 'center', minWidth: 58, padding: '6px 8px', borderRadius: 8,
  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: active ? 'var(--primary-glow)' : won ? 'var(--surface3)' : 'var(--surface2)',
  color: 'var(--text)',
})

export default function StreakRunView({ run, step, phases = [] }) {
  const current = Math.max(0, phases.findIndex(p => p.id === step.phase))
  const matches = [...run.input.matches].sort((a, b) => a.player_id - b.player_id || a.match_day - b.match_day)
  const log = step.phase === 'walk' ? step.rows : []
  const focusPlayer = step.phase === 'walk' ? log.at(-1)?.player_id : step.phase === 'record' ? step.rows.at(-1)?.player_id : undefined
  const processed = new Map(log.map(row => [`${row.player_id}:${row.match_day}`, row]))
  const focusMatches = focusPlayer === undefined ? [] : matches.filter(m => m.player_id === focusPlayer)
  const latest = step.phase === 'walk' ? log.at(-1) : undefined

  return (
    <div aria-label="Winning streak walk" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
      <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
        {phases.map((p, i) => (
          <li key={p.id} aria-current={i === current ? 'step' : undefined} style={{
            padding: '4px 10px', borderRadius: 999, border: `1px solid ${i === current ? 'var(--primary)' : 'var(--border)'}`,
            background: i === current ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)', fontWeight: i === current ? 700 : 400,
          }}>{p.label}</li>
        ))}
      </ol>

      {focusPlayer === undefined && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[...new Set(matches.map(m => m.player_id))].map(pid => (
            <div key={pid} style={{ display: 'grid', gap: 4 }}>
              <strong>Player {pid}</strong>
              <div style={{ display: 'flex', gap: 4 }}>
                {matches.filter(m => m.player_id === pid).map(m => (
                  <span key={m.match_day} style={chipStyle(false, false)}><small>day {m.match_day}</small><strong>{LETTER[m.result]}</strong></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {focusPlayer !== undefined && (
        <div style={{ display: 'grid', gap: 6 }}>
          <strong>Player {focusPlayer}: matches in day order</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {focusMatches.map(m => {
              const row = processed.get(`${m.player_id}:${m.match_day}`)
              const isNow = latest && latest.player_id === m.player_id && latest.match_day === m.match_day
              const inRun = row && row.streak > 0
              return (
                <span key={m.match_day} style={chipStyle(isNow, inRun)} aria-current={isNow ? 'step' : undefined}>
                  <small>day {m.match_day}</small>
                  <strong>{LETTER[m.result]}</strong>
                  <small>{row ? `streak ${row.streak}` : 'not read yet'}</small>
                </span>
              )
            })}
          </div>
          <span style={{ color: 'var(--text-muted)' }}>
            {step.phase === 'walk' ? `Longest so far: ${latest?.longest ?? 0}` : `Longest winning streak: ${step.rows.at(-1)?.longest_streak ?? 0}`}
          </span>
        </div>
      )}

      {step.phase === 'done' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {step.rows.map(row => (
            <span key={row.player_id} style={chipStyle(false, row.longest_streak > 0)}>
              <small>player {row.player_id}</small><strong>{row.longest_streak}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
