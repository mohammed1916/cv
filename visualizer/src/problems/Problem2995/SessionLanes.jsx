// One lane per user, in session order. The first session is marked, and later streams are counted.
export default function SessionLanes({ sessions = [], firsts = [], counted = [] }) {
  const users = [...new Set(sessions.map(row => row.user_id))].sort((a, b) => a - b)
  const firstOf = new Map(firsts.map(row => [row.user_id, row.first_type]))
  const countOf = new Map(counted.map(row => [row.user_id, row.sessions_count]))
  return <section aria-label="Sessions per user" style={{ display: 'grid', gap: 8 }}>
    {users.map(user => {
      const own = sessions.filter(row => row.user_id === user).sort((a, b) => (a.session_start < b.session_start ? -1 : 1))
      const first = own[0]
      const later = own.slice(1).filter(row => row.session_type === 'Streamer').length
      return <div key={user} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', alignItems: 'center', gap: 8 }}>
        <strong style={{ color: 'var(--text)' }}>User {user}</strong>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {own.map((row, index) => <span key={row.session_id} style={{
            padding: '4px 8px', borderRadius: 6, fontSize: 12, color: 'var(--text)',
            border: `2px solid ${index === 0 && firstOf.has(user) ? 'var(--primary)' : 'var(--surface2)'}`,
            background: row.session_type === 'Streamer' ? 'var(--surface2)' : 'transparent',
          }}>
            {index === 0 ? 'first ' : ''}{row.session_type} {row.session_start.slice(5, 16)}
          </span>)}
          {first && firstOf.get(user) === 'Viewer' && <span style={{ fontSize: 12, color: 'var(--text)' }}>
            {countOf.has(user) ? `${countOf.get(user)} counted` : `${later} later streams`}
          </span>}
          {first && firstOf.get(user) !== 'Viewer' && firstOf.has(user) && <span style={{ fontSize: 12, color: 'var(--text)', opacity: 0.7 }}>started as Streamer, excluded</span>}
        </div>
      </div>
    })}
  </section>
}
