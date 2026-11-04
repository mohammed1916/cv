import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

const tint = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, var(--surface2))`

// The array under the current limit: the window, values already replaced by 1, and what is still stable.
function ArrayStrip({ run, step }) {
  const nums = run.input.nums
  const editedSet = new Set(step.edited)
  const inWindow = i => step.l >= 0 && i >= step.l && i <= step.r
  const windowColor = step.phase === 'edit' ? 'var(--error)' : step.phase === 'slide' ? 'var(--text-muted)' : 'var(--primary)'
  return <section aria-label="Array under the current limit">
    <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>
      {step.mid === null ? 'nums' : `nums with limit ${step.mid}: no window of ${step.mid + 1} may stay stable`}
    </h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{nums.map((value, i) => {
      const edited = editedSet.has(i)
      return <div key={i} data-index={i} data-role={edited ? 'edited' : inWindow(i) ? 'window' : ''} style={{
        minWidth: 52, padding: 5, borderRadius: 6, textAlign: 'center', display: 'grid', gap: 2, color: 'var(--text)',
        border: `2px solid ${inWindow(i) ? windowColor : edited ? 'var(--warning)' : 'var(--border)'}`,
        background: edited ? tint('var(--warning)', 22) : inWindow(i) ? tint(windowColor, 14) : 'var(--surface2)',
      }}>
        <small style={{ fontSize: '.65rem', color: 'var(--text-muted)' }}>[{i}]</small>
        {edited
          ? <strong><s style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{value}</s> 1</strong>
          : <strong>{value}</strong>}
        <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', minHeight: '1em' }}>
          {i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : edited ? 'replaced' : ' '}
        </span>
      </div>
    })}</div>
  </section>
}

// The sparse table, with the two cells a step reads or the cell it writes.
function GcdTable({ run, step }) {
  const n = run.input.nums.length
  const levels = []
  for (let level = 0; 1 << level <= n; level++) levels.push(level)
  const roleOf = (level, i) => {
    const focus = step.tableFocus
    if (focus) {
      if (focus.level === level && focus.i === i) return 'target'
      if (focus.from.some(([a, b]) => a === level && b === i)) return 'source'
    }
    const query = step.query
    if (query && query.p === level && (query.a === i || query.b === i)) return 'source'
    return ''
  }
  return <section aria-label="Gcd table">
    <h3 style={{ fontSize: '.9rem', margin: '0 0 6px' }}>Gcd table: row s holds the gcd of the span of s values starting at each index</h3>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '.8rem', color: 'var(--text)' }}>
        <thead><tr><th scope="col" style={{ color: 'var(--text-muted)', padding: '2px 6px' }}>span</th>
          {run.input.nums.map((_, i) => <th scope="col" key={i} style={{ color: 'var(--text-muted)', padding: '2px 6px', fontWeight: 600 }}>{i}</th>)}</tr></thead>
        <tbody>{levels.map(level => <tr key={level}>
          <th scope="row" style={{ color: 'var(--text-muted)', padding: '2px 6px', fontWeight: 600 }}>{1 << level}</th>
          {run.input.nums.map((_, i) => {
            const exists = i + (1 << level) <= n
            const value = step.table[level]?.[i]
            const role = exists ? roleOf(level, i) : ''
            return <td key={i} data-level={level} data-index={i} data-role={role} style={{
              minWidth: 34, textAlign: 'center', padding: '4px 6px', border: exists ? `${role ? 2 : 1}px solid ${role === 'target' ? 'var(--primary)' : role === 'source' ? 'var(--warning)' : 'var(--border)'}` : 'none',
              background: role === 'target' ? tint('var(--primary)', 24) : role === 'source' ? tint('var(--warning)', 20) : value !== undefined && value >= 2 ? tint('var(--success)', 12) : 'transparent',
              fontWeight: role ? 700 : 400,
            }}>{exists ? value ?? '' : ''}</td>
          })}
        </tr>)}</tbody>
      </table>
    </div>
    <p style={{ margin: '4px 0 0', fontSize: '.75rem', color: 'var(--text-muted)' }}>Green tint: that span is stable on its own. Orange: cells read this step. Purple: cell written.</p>
    {step.query && <p style={{ margin: '4px 0 0' }}>
      <code>gcd({step.query.left}, {step.query.right}) = {step.query.g}</code> {step.query.g >= 2 ? 'stable' : 'not stable'}
    </p>}
  </section>
}

function EditMeter({ run, step }) {
  const { maxC } = run.input
  const used = step.edits
  const over = used > maxC
  const slots = Math.max(maxC, used)
  return <section aria-label="Edits against maxC" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
    <strong>Edits {used} of maxC {maxC}</strong>
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{Array.from({ length: slots }, (_, i) => <span key={i} data-role={i >= maxC ? 'over' : i < used ? 'used' : 'free'} style={{
      width: 14, height: 14, borderRadius: 3, border: `2px solid ${i >= maxC ? 'var(--error)' : 'var(--border)'}`,
      background: i >= maxC ? 'var(--error)' : i < used ? 'var(--warning)' : 'transparent',
    }} />)}</span>
    {over && <span style={{ color: 'var(--error)', fontWeight: 700 }}>over budget</span>}
  </section>
}

export default function StabilitySearchView({ run, step }) {
  const showVerdict = step.verdict !== null
  return <section aria-label="Stability factor search" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <AnswerRangeBar title="Search over the longest stable length allowed" min={0} max={run.input.nums.length}
      low={step.lo} high={step.hi} probe={showVerdict ? step.mid : null} verdict={showVerdict ? step.verdict : null} />
    {step.mid !== null && !showVerdict && <p style={{ margin: 0 }}>Testing limit <strong>{step.mid}</strong></p>}
    <ArrayStrip run={run} step={step} />
    {step.phase !== 'build' && <EditMeter run={run} step={step} />}
    <GcdTable run={run} step={step} />
    {step.phase === 'done' && <output aria-label="Answer" style={{ border: '2px solid var(--success)', borderRadius: 6, padding: '6px 10px', background: 'var(--surface2)' }}>
      Minimum stability factor: <strong>{run.result}</strong>
    </output>}
  </section>
}
