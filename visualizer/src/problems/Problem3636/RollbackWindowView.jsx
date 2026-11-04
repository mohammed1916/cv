import RecordStateTable from '../../components/shared/RecordStateTable'

const BAR_HEIGHT = 110

function ArrayLane({ run, step }) {
  const { nums } = run.input
  const { size } = run
  const { l, r, boundary, right, block, tempFrom, tempTo, at } = step
  return <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
    <div style={{ display: 'flex', width: 'max-content' }} aria-label="nums with blocks, permanent and temporary entries">
      {nums.map((value, index) => {
        const permanent = block >= 0 && index >= boundary && index <= right
        const temporary = tempFrom !== null && index >= tempFrom && index <= tempTo
        const inQuery = l !== null && index >= l && index <= r
        const startsBlock = index > 0 && index % size === 0
        const isBoundary = block >= 0 && index === boundary
        const pointers = [l === index && 'l', r === index && 'r', block >= 0 && right === index && right !== r && 'right'].filter(Boolean)
        const fill = temporary ? 'var(--warning-glow)' : permanent ? 'var(--primary-glow)' : 'var(--surface2)'
        return <div key={index} data-index={index} data-role={temporary ? 'temporary' : permanent ? 'permanent' : 'idle'} data-in-query={inQuery || undefined} style={{ marginLeft: startsBlock ? 10 : 2, minWidth: 42, textAlign: 'center', position: 'relative' }}>
          <small style={{ color: 'var(--text-muted)', display: 'block' }}>{index}</small>
          {isBoundary && <span aria-hidden="true" style={{ position: 'absolute', left: -7, top: 0, bottom: 0, borderLeft: '3px solid var(--text-muted)' }} />}
          <div style={{ padding: '6px 4px', fontWeight: 700, color: 'var(--text)', background: fill, borderRadius: 6, border: `2px solid ${index === at ? 'var(--text)' : inQuery ? 'var(--primary)' : 'var(--border)'}`, opacity: inQuery || permanent || l === null ? 1 : 0.55 }}>{value}</div>
          <small style={{ display: 'block', minHeight: 16, fontWeight: 700, color: 'var(--text)' }}>{pointers.join(' ')}</small>
          <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10 }}>{index % size === 0 ? `block ${Math.floor(index / size)}` : ' '}</small>
        </div>
      })}
    </div>
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, color: 'var(--text)' }}>
      <span><i style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--primary-glow)', border: '1px solid var(--primary)', marginRight: 4 }} />kept for this block</span>
      <span><i style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--warning-glow)', border: '1px solid var(--warning)', marginRight: 4 }} />added for this query only</span>
      <span><i style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--primary)', marginRight: 4 }} />inside the query</span>
    </div>
  </div>
}

function CountBars({ run, step }) {
  const { values } = run
  const { counts, mode, modeCount, threshold } = step
  const top = Math.max(1, threshold ?? 0, ...Object.values(counts))
  const unit = BAR_HEIGHT / top
  return <div aria-label="Counts in the window" style={{ overflowX: 'auto' }}>
    <div style={{ position: 'relative', display: 'inline-flex', gap: 6, alignItems: 'flex-end', height: BAR_HEIGHT + 22, minWidth: '100%', borderBottom: '2px solid var(--border)' }}>
      {threshold !== null && <div data-threshold={threshold} aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: threshold * unit, borderTop: '2px dashed var(--text)' }}>
        <small style={{ position: 'absolute', right: 0, bottom: 1, color: 'var(--text)', background: 'var(--surface)', padding: '0 3px' }}>threshold {threshold}</small>
      </div>}
      {values.map(value => {
        const amount = counts[value] || 0
        const isMode = modeCount > 0 && value === mode
        return <div key={value} data-value={value} data-count={amount} data-mode={isMode || undefined} style={{ minWidth: 42, textAlign: 'center' }}>
          <small style={{ color: 'var(--text)', fontWeight: 700 }}>{amount || ''}</small>
          <div style={{ height: amount * unit, background: isMode ? 'var(--primary)' : 'var(--surface3)', border: amount ? `1px solid ${isMode ? 'var(--primary)' : 'var(--text-muted)'}` : 'none', borderRadius: '4px 4px 0 0', transition: 'height 160ms' }} />
        </div>
      })}
    </div>
    <div style={{ display: 'inline-flex', gap: 6, minWidth: '100%' }}>
      {values.map(value => <small key={value} style={{ minWidth: 42, textAlign: 'center', color: 'var(--text)', fontWeight: modeCount > 0 && value === mode ? 700 : 400 }}>{value}</small>)}
    </div>
  </div>
}

export default function RollbackWindowView({ run, step }) {
  const { queries } = run.input
  const rows = run.order.map((index, place) => {
    const [l, r, threshold] = queries[index]
    const answered = place < step.position || (place === step.position && ['answer', 'rollback'].includes(step.phase))
    return { order: place + 1, query: `#${index}`, range: `[${l}, ${r}]`, threshold, block: Math.floor(l / run.size), answer: answered ? step.ans[index] : '' }
  })
  return <section aria-label="Rollback window over nums" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <ArrayLane run={run} step={step} />
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Counts for the current window</h3>
      <CountBars run={run} step={step} />
      <dl style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '8px 0 0' }}>
        <div><dt style={{ color: 'var(--text-muted)' }}>mode</dt><dd style={{ margin: 0, fontWeight: 700 }}>{step.modeCount ? `${step.mode} (count ${step.modeCount})` : 'none'}</dd></div>
        <div><dt style={{ color: 'var(--text-muted)' }}>saved mode</dt><dd style={{ margin: 0, fontWeight: 700 }}>{step.saved ? (step.saved.modeCount ? `${step.saved.mode} (count ${step.saved.modeCount})` : 'none') : 'not saved'}</dd></div>
        <div><dt style={{ color: 'var(--text-muted)' }}>answers so far</dt><dd style={{ margin: 0, fontWeight: 700 }}>{step.phase === 'done' ? `[${step.ans.join(', ')}]` : `${Math.max(0, step.position)} of ${run.order.length} done`}</dd></div>
      </dl>
    </div>
    <RecordStateTable label="Queries in processing order" columns={['order', 'query', 'range', 'threshold', 'block', 'answer']} rows={rows} activeRow={step.phase === 'done' ? -1 : step.position} />
  </section>
}
