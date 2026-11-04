import IndexedSequence from '../../components/shared/IndexedSequence'

const tint = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, transparent)`
const LANE_COLOR = ['var(--primary)', 'var(--info)']

// A timeline of one plan: a lane per dispenser, plus a lane showing how long each car waited.
function Gantt({ schedule, title }) {
  const span = Math.max(1, ...schedule.map(s => s.end))
  const pct = t => `${(t / span) * 100}%`
  const lane = (label, items) => <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'center', gap: 6, marginBottom: 4 }}>
    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
    <div style={{ position: 'relative', height: 28, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4 }}>{items}</div>
  </div>
  const bar = (key, from, to, color, text, testId) => <span key={key} data-testid={testId} style={{
    position: 'absolute', left: pct(from), width: `calc(${pct(to - from)} - 2px)`, top: 2, bottom: 2, borderRadius: 3,
    background: tint(color, 32), border: `1px solid ${color}`, color: 'var(--text)', fontSize: 12, textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap',
  }}>{text}</span>
  const ticks = Array.from({ length: Math.min(span, 12) + 1 }, (_, i) => Math.round((i * span) / Math.min(span, 12)))
  return <section aria-label={title}>
    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{title}</p>
    {lane('dispenser 0', schedule.filter(s => s.d === 0).map(s => bar(s.car, s.start, s.end, LANE_COLOR[0], `car ${s.car}`, `gantt-${s.car}`)))}
    {lane('dispenser 1', schedule.filter(s => s.d === 1).map(s => bar(s.car, s.start, s.end, LANE_COLOR[1], `car ${s.car}`, `gantt-${s.car}`)))}
    {lane('waiting', schedule.filter(s => s.wait > 0).map(s => bar(s.car, s.allowed, s.start, 'var(--warning)', `car ${s.car}: ${s.wait}`, `wait-${s.car}`)))}
    <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>time</span>
      <div style={{ position: 'relative', height: 16, fontSize: 11, color: 'var(--text-muted)' }}>
        {ticks.map(t => <span key={t} style={{ position: 'absolute', left: pct(t), transform: 'translateX(-50%)' }}>{t}</span>)}
      </div>
    </div>
  </section>
}

function Gauges({ fuel, left, busy, highlight }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }} aria-label="Dispenser state">
    {[0, 1].map(d => <div key={d} data-dispenser={d} style={{ flex: '1 1 180px', border: `${highlight === d ? 2 : 1}px solid ${highlight === d ? LANE_COLOR[d] : 'var(--border)'}`, borderRadius: 6, padding: 8, background: 'var(--surface)' }}>
      <strong>Dispenser {d}</strong>
      <div aria-hidden="true" style={{ height: 10, background: 'var(--surface3)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(left[d] / fuel[d]) * 100}%`, background: LANE_COLOR[d] }} />
      </div>
      <small style={{ color: 'var(--text-muted)' }}>fuel left {left[d]} of {fuel[d]} · busy for {busy[d]}</small>
    </div>)}
  </div>
}

const stateText = s => `fuel ${s.left[0]}, ${s.left[1]} · busy ${s.busy[0]}, ${s.busy[1]}`

function StateList({ title, states, active, changedKey, emptyText }) {
  return <section aria-label={title} style={{ flex: '1 1 240px', minWidth: 0 }}>
    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{title}</p>
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 3, maxHeight: 230, overflowY: 'auto' }}>
      {states.map((s, i) => {
        const key = `${s.left}|${s.busy}`
        const isActive = i === active
        const isChanged = key === changedKey
        return <li key={key} data-state={key} data-active={isActive || undefined} data-changed={isChanged || undefined} style={{
          padding: '3px 8px', borderRadius: 4, fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 10,
          background: isActive ? tint('var(--primary)', 24) : isChanged ? tint('var(--success)', 24) : 'var(--surface2)',
          border: `1px solid ${isActive ? 'var(--primary)' : isChanged ? 'var(--success)' : 'var(--border)'}`, color: 'var(--text)',
        }}>
          <span>{stateText(s)}</span><strong>longest {s.worst}</strong>
        </li>
      })}
      {states.length === 0 && <li style={{ fontSize: 13, color: 'var(--text-muted)' }}>{emptyText}</li>}
    </ol>
  </section>
}

// One layer of states feeding the next, with the plan and dispensers behind the state in focus.
export default function DispatchView({ run, step }) {
  const { demand, fuel } = run.input
  const focus = step.best ?? (step.active >= 0 ? step.layer[step.active] : step.layer[0])
  const candidate = step.candidate
  const shownLeft = candidate && !candidate.blocked ? candidate.left : focus.left
  const shownBusy = candidate && !candidate.blocked ? candidate.busy : focus.busy
  const changedKey = candidate && !candidate.blocked ? `${candidate.left}|${candidate.busy}` : null
  const schedule = step.schedule.length ? step.schedule : focus.history
  const planTitle = step.phase === 'done' ? 'Best plan' : step.active >= 0 ? 'Plan leading to this state' : 'Plan behind the first listed state'
  const nextCount = step.served + 1
  const roleAt = i => {
    if (i < step.served) return 'served'
    if (i === step.car && step.phase !== 'done') return ''
    return 'waiting'
  }
  const active = step.phase === 'done' || step.phase === 'start' ? -1 : step.car
  return <section aria-label="Dispenser assignment search" style={{ color: 'var(--text)', display: 'grid', gap: 12 }}>
    <IndexedSequence label="Cars in order: fuel each one needs" length={demand.length} valueAt={i => demand[i]} active={active} roleAt={roleAt} />
    {step.phase === 'done' && <p data-testid="dispatch-answer" style={{ margin: 0, fontWeight: 600 }}>
      {run.result === -1 ? 'No car served: -1' : `${step.served} of ${demand.length} cars served · smallest longest wait ${run.result}`}
    </p>}
    <Gauges fuel={fuel} left={shownLeft} busy={shownBusy} highlight={candidate ? candidate.d : -1} />
    <Gantt schedule={schedule} title={planTitle} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
      <StateList title={`States after ${step.served} car${step.served === 1 ? '' : 's'}`} states={step.layer} active={step.active} emptyText="None" />
      {step.phase !== 'done' && step.phase !== 'start' && step.phase !== 'advance' && <StateList title={`States after ${nextCount} car${nextCount === 1 ? '' : 's'}`} states={step.next} active={-1} changedKey={changedKey} emptyText="None yet" />}
    </div>
    {candidate && !candidate.blocked && <p style={{ margin: 0, fontSize: 14 }}>
      {step.verdict === 'keep' ? 'Kept' : 'Dropped'}: dispenser {candidate.d}, wait {candidate.wait}, longest wait {candidate.worst}.
    </p>}
  </section>
}
