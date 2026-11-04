import OperationLog from '../../components/shared/OperationLog'

function Lane({ title, values, tagAt, toneAt }) {
  return <figure style={{ margin: 0 }} aria-label={title}>
    <figcaption style={{ fontWeight: 700, marginBottom: 6 }}>{title}</figcaption>
    {values.length === 0 && <p style={{ margin: 0, color: 'var(--text-dim)' }}>empty</p>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {values.map((value, i) => {
        const tone = toneAt(i)
        return <div key={i} data-index={i} data-tone={tone || undefined} style={{ minWidth: 48, textAlign: 'center', padding: '3px 6px', borderRadius: 6, border: `2px solid ${tone ? `var(--${tone})` : 'var(--border)'}`, background: tone ? `color-mix(in srgb, var(--${tone}) 18%, var(--surface2))` : 'var(--surface2)', color: 'var(--text)' }}>
          <small style={{ display: 'block', color: 'var(--text-dim)' }}>[{i}]</small>
          <strong>{value}</strong>
          <small style={{ display: 'block', minHeight: 15 }}>{tagAt(i)}</small>
        </div>
      })}
    </div>
  </figure>
}

// One call moves through the same four structures: arrival queue, total, sorted list and count ranking.
export default function TrackerView({ step }) {
  const t = step.touched
  const { queue, sorted, ranked, total } = step
  const peak = Math.max(1, ...ranked.map(r => r.count))
  const medianAt = sorted.length >> 1
  const answer = step.op >= 0 ? step.ops[step.op].returned : undefined
  const isQuery = step.phase === 'mean' || step.phase === 'median' || step.phase === 'mode'
  return <section aria-label="Tracker structures" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <OperationLog title="Calls" ops={step.ops} current={step.op} through={step.op} />
    <Lane title="Queue, oldest first" values={queue}
      tagAt={i => i === 0 ? 'oldest' : i === queue.length - 1 ? 'newest' : ''}
      toneAt={i => t.queue === i ? (t.leaving ? 'error' : 'success') : ''} />
    <Lane title="Sorted list" values={sorted}
      tagAt={i => i === medianAt ? 'count // 2' : ''}
      toneAt={i => t.median === i ? 'success' : t.sorted === i ? (t.leavingSorted ? 'error' : 'success') : i === medianAt ? 'primary' : ''} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
      <figure style={{ margin: 0, flex: '1 1 240px' }} aria-label="Ranking by count then value">
        <figcaption style={{ fontWeight: 700, marginBottom: 6 }}>Ranking: most frequent first, smaller value on a tie</figcaption>
        {ranked.length === 0 && <p style={{ margin: 0, color: 'var(--text-dim)' }}>empty</p>}
        {ranked.map((r, i) => <div key={r.value} data-value={r.value} data-rank={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 24px', gap: 8, alignItems: 'center', marginBottom: 4, fontWeight: i === 0 ? 700 : 400 }}>
          <span>{i === 0 ? 'mode ' : ''}{r.value}</span>
          <span style={{ height: 14, background: 'var(--surface2)', borderRadius: 3 }}><span style={{ display: 'block', height: '100%', width: `${r.count / peak * 100}%`, borderRadius: 3, background: t.rankedValue === r.value ? 'var(--success)' : 'var(--primary)' }} /></span>
          <span>{r.count}</span>
        </div>)}
      </figure>
      <dl style={{ margin: 0, flex: '1 1 180px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }} aria-label="Totals">
        <dt>total</dt><dd style={{ margin: 0, fontWeight: t.total ? 700 : 400, color: 'var(--text)', outline: t.total ? '2px solid var(--primary)' : 'none', padding: '0 4px', width: 'fit-content' }}>{total}</dd>
        <dt>count</dt><dd style={{ margin: 0 }}>{queue.length}</dd>
        {t.meanOf !== undefined && <><dt>total // count</dt><dd style={{ margin: 0 }}>{total} // {t.meanOf} = {answer}</dd></>}
        {isQuery && <><dt>returned</dt><dd style={{ margin: 0 }}><strong>{answer}</strong></dd></>}
      </dl>
    </div>
  </section>
}
