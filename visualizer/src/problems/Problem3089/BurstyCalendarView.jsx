import RecordStateTable from '../../components/shared/RecordStateTable'

const DAY = 22

// One calendar row per user. The 7-day window slides over the row; the bar beside it shows the peak against the bar to clear.
function UserRow({ entry, step }) {
  const counts = {}
  entry.days.forEach(day => { counts[day] = (counts[day] || 0) + 1 })
  const active = step.user === entry.user_id
  const window = active ? step.window : null
  const need = entry.average === null ? null : entry.average * 2
  const scale = Math.max(entry.count, 1)
  const verdict = entry.verdict
  return <div data-user={entry.user_id} data-active={active} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 4, borderRadius: 8, background: active ? 'var(--surface2)' : 'transparent', minWidth: 'max-content' }}>
    <strong style={{ width: 62, flex: 'none' }}>user {entry.user_id}</strong>
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(28, ${DAY}px)`, flex: 'none' }}>
      {Array.from({ length: 28 }, (_, index) => {
        const day = index + 1
        const posts = counts[day] || 0
        const inWindow = window && day >= window.start && day <= window.end
        return <div key={day} data-day={day} data-posts={posts} data-in-window={inWindow || undefined} style={{ height: DAY + 6, display: 'grid', placeItems: 'center', fontSize: 12, color: 'var(--text)', fontWeight: posts ? 700 : 400, background: posts ? (inWindow ? 'var(--primary-glow)' : 'var(--surface3)') : 'transparent', borderLeft: index % 7 === 0 ? '2px solid var(--border)' : '1px solid var(--border)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{posts || ''}</div>
      })}
      {window && <div aria-hidden="true" style={{ position: 'absolute', top: -2, bottom: -2, left: (window.start - 1) * DAY, width: (Math.min(window.end, 28) - window.start + 1) * DAY, border: '2px solid var(--primary)', borderRight: window.end > 28 ? '2px dashed var(--primary)' : '2px solid var(--primary)', borderRadius: 4, pointerEvents: 'none' }} />}
    </div>
    <div style={{ width: 150, flex: 'none' }} aria-label={`Peak against the bar for user ${entry.user_id}`}>
      {need === null ? <small style={{ color: 'var(--text-muted)' }}>{entry.count} post{entry.count === 1 ? '' : 's'}, waiting</small> : <>
        <div style={{ position: 'relative', height: 12, background: 'var(--surface3)', borderRadius: 4 }}>
          <div data-peak={entry.peak ?? 0} style={{ height: '100%', width: `${((entry.peak ?? 0) / scale) * 100}%`, background: verdict === false ? 'var(--text-muted)' : 'var(--primary)', borderRadius: 4 }} />
          <div data-need={need} style={{ position: 'absolute', top: -3, bottom: -3, left: `${(need / scale) * 100}%`, width: 2, background: 'var(--text)' }} />
        </div>
        <small style={{ color: 'var(--text-muted)' }}>peak {entry.peak ?? 0} · bar {need}</small>
      </>}
    </div>
    <span data-verdict={verdict ?? undefined} style={{ width: 66, flex: 'none', textAlign: 'center', padding: '2px 4px', borderRadius: 6, color: 'var(--text)', background: verdict === true ? 'var(--success-glow)' : verdict === false ? 'var(--error-glow)' : 'transparent' }}>{verdict === true ? 'bursty' : verdict === false ? 'steady' : ''}</span>
  </div>
}

export default function BurstyCalendarView({ run, step }) {
  const tableRows = run.rows.map(row => ({
    post_id: row.post_id, user_id: row.user_id, post_date: row.post_date,
    status: !step.filtered ? '' : row.kept ? 'kept' : 'ignored',
  }))
  return <section aria-label="Posts by user across February 2024" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    {step.grouped && <div>
      <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>1 to 28 February, four weeks</h3>
      <div style={{ overflowX: 'auto', display: 'grid', gap: 6, paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 'max-content', paddingLeft: 4 }}>
          <span style={{ width: 62, flex: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(28, ${DAY}px)`, flex: 'none' }}>
            {Array.from({ length: 28 }, (_, index) => <small key={index} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 10 }}>{index + 1}</small>)}
          </div>
        </div>
        {step.stats.length ? step.stats.map(entry => <UserRow key={entry.user_id} entry={entry} step={step} />) : <p style={{ margin: 0 }}>No posts in range.</p>}
      </div>
      {step.window && <p style={{ margin: '6px 0 0' }}><strong>{step.window.inside}</strong> post{step.window.inside === 1 ? '' : 's'} inside the 7 days from 2/{step.window.start}.</p>}
    </div>}
    <RecordStateTable label="Posts" columns={['post_id', 'user_id', 'post_date', 'status']} rows={tableRows} />
    <RecordStateTable label="Result" columns={['user_id', 'max_7day_posts', 'avg_weekly_posts']} rows={step.output} />
  </section>
}
