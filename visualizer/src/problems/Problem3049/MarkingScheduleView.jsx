import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import HeapView from '../../components/shared/HeapView'

const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, var(--surface2))`
const heading = { margin: '10px 0 6px', fontSize: '0.95rem' }

const ROLE = {
  idle: { text: ' ', background: 'var(--surface2)' },
  later: { text: 'past t', background: 'transparent' },
  todo: { text: 'not yet', background: 'var(--surface2)' },
  free: { text: 'free', background: tint('var(--success)', 35) },
  reset: { text: 'reset', background: tint('var(--primary)', 45) },
  undone: { text: 'undone', background: tint('var(--error)', 30) },
}

const ACTION = {
  reset: { text: 'reset', background: tint('var(--primary)', 45) },
  decrement: { text: '−1', background: 'var(--surface2)' },
  mark: { text: 'mark', background: tint('var(--success)', 40) },
  idle: { text: 'idle', background: 'transparent' },
}

function Ledger({ free, needed, t }) {
  const scale = Math.max(1, t ?? 1, free, needed)
  const fits = needed <= free
  const bar = (label, value, color) => <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px', alignItems: 'center', gap: 8, fontSize: 13 }}>
    <span>{label}</span>
    <div style={{ background: 'var(--surface2)', height: 16, borderRadius: 4, border: '1px solid var(--border)' }}>
      <div style={{ width: `${Math.min(100, (value / scale) * 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .25s' }} />
    </div>
    <strong>{value}</strong>
  </div>
  return <section aria-label="Free seconds against remaining work" style={{ display: 'grid', gap: 4 }}>
    {bar('Free seconds', free, 'var(--success)')}
    {bar('Work without a reset', needed, fits ? tint('var(--primary)', 60) : 'var(--error)')}
  </section>
}

// The search on the deadline, the seconds scanned backward, which index got a reset, the heap of chosen resets and the final schedule.
export default function MarkingScheduleView({ run, step }) {
  const { nums, changeIndices } = run.input
  const { low, high, probe, verdict, t, s, roles, heap, free, needed, kept, firstList, plan } = step
  const m = changeIndices.length
  const firstOf = new Map(firstList)
  const keptSet = new Set(kept)
  return <section aria-label="Marking schedule" style={{ color: 'var(--text)' }}>
    <AnswerRangeBar title="Search for the earliest deadline" min={1} max={m + 1} low={low} high={high} probe={probe} verdict={verdict} />
    <p style={{ margin: '0 0 6px', fontSize: 13 }}>
      {t !== null ? <strong>{`Testing deadline t = ${t}`}</strong> : 'No deadline under test.'} <span style={{ color: 'var(--text-muted)' }}>{`Position ${m + 1} on the bar means impossible.`}</span>
    </p>

    <h3 style={heading}>Seconds, scanned from t back to 1</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Seconds">
      {changeIndices.map((index, at) => {
        const role = ROLE[roles[at]]
        return <div key={at} data-second={at + 1} data-role={roles[at]} style={{
          width: 54, textAlign: 'center', padding: '3px 0', borderRadius: 6, fontSize: 12, background: role.background,
          border: `2px ${roles[at] === 'later' ? 'dashed' : 'solid'} ${s === at + 1 ? 'var(--primary)' : 'var(--border)'}`,
          opacity: roles[at] === 'later' ? 0.55 : 1,
        }}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>s={at + 1}</small>
          <strong>{`index ${index}`}</strong>
          <span style={{ display: 'block' }}>{role.text}</span>
        </div>
      })}
    </div>

    <h3 style={heading}>nums, and how each index gets to 0</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Indices">
      {nums.map((value, at) => {
        const index = at + 1
        const isKept = keptSet.has(index)
        const how = value === 0 ? 'already 0' : isKept ? `reset at s=${firstOf.get(index)}` : firstOf.has(index) ? `first chance s=${firstOf.get(index)}` : 'never resettable'
        return <div key={index} data-index={index} data-kept={isKept} style={{
          minWidth: 92, textAlign: 'center', padding: '3px 6px', borderRadius: 6, fontSize: 12,
          border: '2px solid var(--border)', background: isKept ? tint('var(--primary)', 45) : 'var(--surface2)',
        }}>
          <small style={{ display: 'block', color: 'var(--text-muted)' }}>index {index}</small>
          <strong>{value}</strong>
          <span style={{ display: 'block' }}>{how}</span>
        </div>
      })}
    </div>

    <h3 style={heading}>Does the rest of the work fit?</h3>
    <Ledger free={free} needed={needed} t={t} />

    <div style={{ marginTop: 10 }}>
      <HeapView title="Resets kept, smallest saving on top (value@index)" items={heap.items} ops={heap.ops} order="min" />
    </div>

    {plan && <>
      <h3 style={heading}>One schedule that meets the deadline</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Schedule">
        {plan.map(entry => {
          const look = ACTION[entry.action]
          return <div key={entry.second} data-action={entry.action} style={{ width: 54, textAlign: 'center', padding: '3px 0', borderRadius: 6, fontSize: 12, background: look.background, border: '2px solid var(--border)' }}>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>s={entry.second}</small>
            <strong>{look.text}</strong>
            <span style={{ display: 'block' }}>{entry.index === null ? ' ' : `index ${entry.index}`}</span>
          </div>
        })}
      </div>
    </>}
    <output aria-label="Search state" style={{ display: 'block', marginTop: 10, fontWeight: 700 }}>{step.phase === 'done' ? `answer = ${run.result}` : `low = ${low}, high = ${high}`}</output>
  </section>
}
