import RecordStateTable from '../../components/shared/RecordStateTable'

const shown = name => name === null ? 'None' : name === '' ? '""' : name
const cell = { padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text)' }

function MaskChip({ value }) {
  if (value === null) return <span style={{ color: 'var(--text-dim)' }}>?</span>
  const tone = value ? 'var(--success)' : 'var(--error)'
  return <strong style={{ display: 'inline-block', minWidth: 52, textAlign: 'center', padding: '1px 6px', borderRadius: 6, border: `2px solid ${tone}`, color: 'var(--text)', background: `color-mix(in srgb, ${tone} 18%, var(--surface2))` }}>{value ? 'True' : 'False'}</strong>
}

// The source table with its boolean mask beside it, then the rows the mask lets through.
export default function MaskFilterView({ run, step }) {
  const { students } = run.input
  const filtering = step.phase === 'filter' || step.phase === 'done'
  const passed = new Set(step.kept)
  const stateOf = i => {
    if (!filtering || step.mask[i] === null) return 'pending'
    if (step.mask[i] === false && (step.phase === 'done' || i <= step.at)) return 'dropped'
    return passed.has(i) ? 'kept' : 'pending'
  }
  return <section aria-label="Filtering the students table" style={{ display: 'grid', gap: 16, color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 460 }}>
        <caption style={{ textAlign: 'left', fontWeight: 700, marginBottom: 6 }}>students, with the mask from name.notnull()</caption>
        <thead><tr>{['index', 'student_id', 'name', 'age', 'mask', 'outcome'].map(h => <th key={h} scope="col" style={cell}>{h}</th>)}</tr></thead>
        <tbody>{students.map((row, i) => {
          const state = stateOf(i)
          const isCurrent = i === step.at
          return <tr key={i} data-row={i} data-state={state} aria-current={isCurrent ? 'step' : undefined}
            style={{ opacity: state === 'dropped' ? 0.5 : 1, background: isCurrent ? 'color-mix(in srgb, var(--primary) 16%, transparent)' : state === 'kept' ? 'color-mix(in srgb, var(--success) 9%, transparent)' : undefined, textDecoration: state === 'dropped' ? 'line-through' : 'none', outline: isCurrent ? '2px solid var(--primary)' : 'none', outlineOffset: -2 }}>
            <td style={cell}>{i}</td>
            <td style={cell}>{row.student_id}</td>
            <td style={{ ...cell, fontWeight: isCurrent ? 700 : 400, background: row.name === null ? 'color-mix(in srgb, var(--error) 16%, transparent)' : undefined }}>{shown(row.name)}</td>
            <td style={cell}>{row.age}</td>
            <td style={{ ...cell, textDecoration: 'none' }}><MaskChip value={step.mask[i]} /></td>
            <td style={cell}>{state === 'kept' ? 'stays' : state === 'dropped' ? 'dropped' : '—'}</td>
          </tr>
        })}{students.length === 0 && <tr><td style={cell} colSpan={6}>No rows</td></tr>}</tbody>
      </table>
    </div>
    <RecordStateTable label="Result table" columns={['index', 'student_id', 'name', 'age']}
      rows={step.kept.map(i => ({ index: i, student_id: students[i].student_id, name: shown(students[i].name), age: students[i].age }))}
      activeRow={step.phase === 'filter' ? step.kept.indexOf(step.at) : -1} />
  </section>
}
