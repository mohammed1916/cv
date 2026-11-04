// Draws every task as a lane that starts at time 0. A finished lane fills up to its finish time,
// and its result lands in the slot that matches its position in the input.
export default function ParallelLanesView({ tasks, step }) {
  const values = step.state?.values ?? null
  const now = step.state?.time ?? 0
  const longest = Math.max(1, ...tasks.map(task => task.ms))
  const rejected = step.state?.rejected ?? null
  return <section aria-label="Parallel task lanes" style={{ display: 'grid', gap: 12 }}>
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Every task starts at time 0. The bar grows until the task finishes.</p>
    <div style={{ display: 'grid', gap: 6 }}>
      {tasks.map((task, index) => {
        const done = values !== null && values[index] !== null && values[index] !== undefined
        const isRejected = rejected === task.id
        const width = done || isRejected ? (task.ms / longest) * 100 : (Math.min(now, task.ms) / longest) * 100
        return <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', alignItems: 'center', gap: 8 }}>
          <code style={{ color: 'var(--text)' }}>{task.id}</code>
          <div style={{ position: 'relative', height: 18, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4 }}>
            <div style={{ width: `${width}%`, height: '100%', borderRadius: 4, background: isRejected ? 'var(--error)' : done ? 'var(--success)' : 'var(--primary)' }} />
            <span style={{ position: 'absolute', right: 6, top: 0, lineHeight: '18px', fontSize: 12, color: 'var(--text)' }}>{task.fail ? `${task.ms}ms rejects` : `${task.ms}ms`}</span>
          </div>
        </div>
      })}
    </div>
    <div aria-label="Result slots" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tasks.map((task, index) => {
        const filled = values !== null && values[index] !== null && values[index] !== undefined
        return <div key={task.id} style={{ minWidth: 72, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: filled ? 'var(--primary-glow)' : 'var(--surface)', color: 'var(--text)' }}>
          <small style={{ color: 'var(--text-muted)' }}>slot {index}</small>
          <div>{filled ? values[index] : ' '}</div>
        </div>
      })}
    </div>
  </section>
}
