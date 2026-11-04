const OUTPUT = ['name', 'age']
const COLUMNS = ['student_id', 'name', 'age']
const tint = (token, percent) => `color-mix(in srgb, var(${token}) ${percent}%, transparent)`
const cell = { padding: '6px 12px', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'left' }

// One table that loses rows and then columns, with the True/False mask drawn beside it.
export default function SelectionView({ run, step }) {
  const { students } = run.input
  const filtered = ['filter', 'project', 'done'].includes(step.phase)
  const projected = ['project', 'done'].includes(step.phase)
  const dropRow = index => filtered && !step.mask[index]
  const dropColumn = column => projected && !OUTPUT.includes(column)
  const kept = step.mask.filter(Boolean).length
  return <section aria-label="Row and column selection" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 340 }}>
        <caption style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 700 }}>students</caption>
        <thead><tr>
          {COLUMNS.map(column => <th key={column} scope="col" data-dropped={dropColumn(column)} style={{ ...cell, background: 'var(--surface3)', opacity: dropColumn(column) ? 0.35 : 1, textDecoration: dropColumn(column) ? 'line-through' : 'none' }}>{column}</th>)}
          <th scope="col" style={{ ...cell, background: tint('--primary', 18), opacity: projected ? 0.35 : 1 }}>student_id == 101</th>
        </tr></thead>
        <tbody>{students.length ? students.map((row, index) => {
          const value = step.mask[index]
          const active = index === step.at
          return <tr key={index} data-row={index} data-dropped={dropRow(index)} aria-current={active ? 'step' : undefined}
            style={{ opacity: dropRow(index) ? 0.3 : 1, textDecoration: dropRow(index) ? 'line-through' : 'none', outline: active ? '3px solid var(--primary)' : 'none', outlineOffset: -2 }}>
            {COLUMNS.map(column => <td key={column} style={{ ...cell, opacity: dropColumn(column) ? 0.35 : 1, background: value && !dropColumn(column) ? tint('--success', 16) : 'transparent', fontWeight: column === 'student_id' && active ? 700 : 400 }}>{row[column]}</td>)}
            <td style={{ ...cell, fontWeight: 700, opacity: projected ? 0.35 : 1, background: value === true ? tint('--success', 22) : value === false ? tint('--warning', 14) : 'transparent' }}>{value === null ? '?' : value ? 'True' : 'False'}</td>
          </tr>
        }) : <tr><td colSpan={4} style={cell}>The table has no rows.</td></tr>}</tbody>
      </table>
    </div>
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{filtered ? `${kept} of ${students.length} rows kept` : `${step.mask.filter(value => value !== null).length} of ${students.length} rows compared`}{projected ? ' · student_id dropped' : ''}</p>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 200 }}>
        <caption style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 700 }}>Result</caption>
        <thead><tr>{OUTPUT.map(column => <th key={column} scope="col" style={{ ...cell, background: 'var(--surface3)' }}>{column}</th>)}</tr></thead>
        <tbody>{step.result?.length
          ? step.result.map((row, index) => <tr key={index}>{OUTPUT.map(column => <td key={column} style={{ ...cell, background: tint('--success', 16) }}>{row[column]}</td>)}</tr>)
          : <tr><td colSpan={2} style={{ ...cell, color: 'var(--text-muted)' }}>{step.result ? 'Empty: no student has id 101.' : 'Fills in once the columns are picked.'}</td></tr>}</tbody>
      </table>
    </div>
  </section>
}
