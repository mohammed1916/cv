import RecordStateTable from '../../components/shared/RecordStateTable'

// The scoreboard stays in view while the current student's rows are checked below it.
export default function StudentFilterView({ step }) {
  return <section aria-label="Student filter state" style={{ color: 'var(--text)' }}>
    <RecordStateTable label="Students" columns={['student_id', 'name', 'major', 'average', 'mandatory', 'electives', 'result']} rows={step.board} activeRow={step.current} />
    {step.detail && <RecordStateTable label={step.detailTitle} columns={step.detail.columns} rows={step.detail.rows} activeRow={step.activeDetail} />}
    {step.checks && <div aria-label="HAVING conditions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0' }}>
      {step.checks.map(check => <div key={check.label} data-ok={String(check.ok)} style={{ flex: '1 1 170px', padding: '6px 10px', borderRadius: 6, background: 'var(--surface2)', borderLeft: `4px solid ${check.ok ? 'var(--success)' : 'var(--error)'}` }}>
        <strong style={{ display: 'block', fontSize: '.8rem' }}>{check.label}</strong>
        <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{check.detail} · </span>
        <strong style={{ fontSize: '.75rem', color: check.ok ? 'var(--success)' : 'var(--error)' }}>{check.ok ? 'holds so far' : 'broken'}</strong>
      </div>)}
    </div>}
    <RecordStateTable label="Result table" columns={['student_id']} rows={step.output.map(student_id => ({ student_id }))} />
  </section>
}
