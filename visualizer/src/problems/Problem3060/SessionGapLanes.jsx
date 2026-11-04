// One lane per user. Sessions of each type are drawn on a shared clock, with the gap to the previous same-type session labelled.
export default function SessionGapLanes({ sessions = [], step }) {
  const users = [...new Set(sessions.map(row => row.user_id))].sort((a, b) => a - b)
  const stamp = text => Date.parse(`${text.replace(' ', 'T')}Z`)
  const all = sessions.map(row => [stamp(row.session_start), stamp(row.session_end)])
  const min = Math.min(...all.map(([s]) => s)), max = Math.max(...all.map(([, e]) => e))
  const span = Math.max(1, max - min)
  const pct = t => `${((t - min) / span) * 100}%`
  const current = step.columns?.includes('session_type') ? step.rows : []
  const focus = new Set(current.map(row => row.session_id))
  return <section aria-label="Sessions per user on one clock" style={{ display: 'grid', gap: 8, margin: '8px 0' }}>
    {users.map(user => <div key={user} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 8, alignItems: 'center' }}>
      <strong style={{ color: 'var(--text)' }}>User {user}</strong>
      <div style={{ display: 'grid', gap: 4 }}>
        {['Viewer', 'Streamer'].map(type => <div key={type} style={{ position: 'relative', height: 22, background: 'var(--surface2)', borderRadius: 4 }}>
          {sessions.filter(row => row.user_id === user && row.session_type === type).map(row => <span key={row.session_id} title={`${row.session_start} to ${row.session_end}`} style={{
            position: 'absolute', top: 2, bottom: 2, left: pct(stamp(row.session_start)),
            width: `${Math.max(0.6, ((stamp(row.session_end) - stamp(row.session_start)) / span) * 100)}%`,
            borderRadius: 3, border: `2px solid ${focus.has(row.session_id) ? 'var(--primary)' : 'transparent'}`,
            background: type === 'Viewer' ? 'var(--primary)' : 'var(--text)', opacity: 0.85,
          }} />)}
          <span style={{ position: 'absolute', left: 4, top: 2, fontSize: 11, color: 'var(--text)' }}>{type}</span>
        </div>)}
      </div>
    </div>)}
    <p style={{ fontSize: 12, color: 'var(--text)', margin: 0 }}>Bars share one clock. Outlined bars are the two sessions being compared; the gap is measured from the end of the earlier one to the start of the later one.</p>
  </section>
}
