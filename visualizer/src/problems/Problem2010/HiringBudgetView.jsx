import RecordStateTable from '../../components/shared/RecordStateTable'
import { BUDGET } from './algorithm'

const money = value => `$${value.toLocaleString('en-US')}`
const LEVEL_COLOR = { Senior: 'var(--primary)', Junior: 'var(--info)' }
const STATUS = {
  waiting: { text: 'waiting', color: 'var(--text-muted)' },
  checking: { text: 'checking', color: 'var(--warning)' },
  hired: { text: 'hired', color: 'var(--success)' },
  unaffordable: { text: 'out of reach', color: 'var(--error)' },
}

// The budget as one bar: paid salaries fill it from the left and the candidate under review is tested against the free part.
function BudgetBar({ step, candidate, level }) {
  const percent = value => `${(value / BUDGET) * 100}%`
  const reviewing = candidate && candidate.status !== 'hired'
  const fits = reviewing && candidate.salary <= step.remaining
  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text)' }}>
      <strong>Budget {money(BUDGET)}</strong>
      <span>spent {money(step.spent)} · left <strong>{money(step.remaining)}</strong></span>
    </div>
    <div role="img" aria-label={`Budget bar: ${money(step.spent)} spent of ${money(BUDGET)}`} style={{ display: 'flex', height: 42, marginTop: 4, border: '2px solid var(--text-muted)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface2)' }}>
      {step.paid.map(entry => <div key={entry.employee_id} title={`${entry.employee_id}: ${money(entry.salary)}`} style={{ width: percent(entry.salary), background: `color-mix(in srgb, ${LEVEL_COLOR[entry.experience]} 28%, var(--surface))`, borderRight: `2px solid ${LEVEL_COLOR[entry.experience]}`, color: 'var(--text)', fontSize: 11, textAlign: 'center', overflow: 'hidden', lineHeight: '38px', whiteSpace: 'nowrap' }}>{entry.employee_id}</div>)}
      {reviewing && <div title={`Trying ${candidate.employee_id}`} style={{ width: percent(Math.min(candidate.salary, step.remaining)), backgroundImage: `repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in srgb, ${fits ? 'var(--success)' : 'var(--error)'} 40%, transparent) 6px 12px)`, color: 'var(--text)', fontSize: 11, textAlign: 'center', overflow: 'hidden', lineHeight: '38px', whiteSpace: 'nowrap' }}>{candidate.employee_id}</div>}
    </div>
    <p style={{ margin: '4px 0 0', fontSize: 13, minHeight: 20, color: 'var(--text)' }}>
      {reviewing
        ? <>{level} {candidate.employee_id}: {money(candidate.salary)} {fits ? '≤' : '>'} {money(step.remaining)} left <strong style={{ color: fits ? 'var(--success)' : 'var(--error)' }}>{fits ? 'fits' : `over by ${money(candidate.salary - step.remaining)}`}</strong></>
        : <span style={{ color: 'var(--text-muted)' }}>Solid blocks are paid salaries; stripes test the next one against the free space.</span>}
    </p>
  </div>
}

function Lane({ title, level, entries, isSorted, active, candidateId }) {
  return <section aria-label={title} style={{ flex: '1 1 260px', minWidth: 0, padding: 8, borderRadius: 8, border: `2px solid ${active ? LEVEL_COLOR[level] : 'var(--border)'}`, background: 'var(--surface2)' }}>
    <h4 style={{ margin: '0 0 6px', color: 'var(--text)' }}>{title} <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{isSorted ? 'cheapest first' : 'not sorted yet'}</small></h4>
    {entries.length === 0 && <p style={{ margin: 0, color: 'var(--text-muted)' }}>No candidates</p>}
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
      {entries.map(entry => {
        const status = STATUS[entry.status]
        return <li key={entry.employee_id} data-employee={entry.employee_id} data-status={entry.status} aria-current={entry.employee_id === candidateId ? 'step' : undefined}
          style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 6, alignItems: 'center', padding: '3px 6px', borderRadius: 5, color: 'var(--text)', fontSize: 13, border: `2px solid ${entry.employee_id === candidateId ? status.color : 'transparent'}`, background: 'var(--surface)', opacity: entry.status === 'unaffordable' ? 0.75 : 1 }}>
          <strong>{entry.employee_id}</strong>
          <span>{money(entry.salary)}</span>
          <span style={{ color: status.color, fontWeight: 600, textDecoration: entry.status === 'unaffordable' ? 'line-through' : 'none' }}>{status.text}</span>
        </li>
      })}
    </ol>
  </section>
}

export default function HiringBudgetView({ run, step }) {
  const pool = step.level === 'Senior' ? step.seniors : step.level === 'Junior' ? step.juniors : []
  const candidate = pool.find(entry => entry.employee_id === step.candidateId) ?? null
  return <section aria-label="Hiring within the budget" style={{ display: 'grid', gap: 10, color: 'var(--text)' }}>
    <BudgetBar step={step} candidate={candidate} level={step.level} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Lane title="1. Seniors" level="Senior" entries={step.seniors} isSorted={step.sorted.Senior} active={step.level === 'Senior'} candidateId={step.candidateId} />
      <Lane title="2. Juniors" level="Junior" entries={step.juniors} isSorted={step.sorted.Junior} active={step.level === 'Junior'} candidateId={step.candidateId} />
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
      <RecordStateTable label="Candidates" columns={['employee_id', 'experience', 'salary']} rows={run.input.Candidates} activeRow={step.sourceRow} />
      <RecordStateTable label="Result" columns={['employee_id']} rows={step.hired.map(employee_id => ({ employee_id }))} activeRow={step.phase === 'hire' ? step.hired.indexOf(step.candidateId) : -1} />
    </div>
  </section>
}
