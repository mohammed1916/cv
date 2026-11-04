const cell = { padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text)' }
const stateLabel = { waiting: 'waiting', reading: 'reading', written: 'doubled' }

// A DataFrame with one mutable column: the bar shows the original pay and the extra amount the write adds.
export default function SalaryColumnView({ run, step }) {
  const rows = run.input.employees
  const peak = Math.max(1, ...rows.map(row => Math.abs(row.salary) * 2))
  const stateOf = i => (i === step.at && step.phase === 'read' ? 'reading' : i < step.written ? 'written' : 'waiting')
  return <section aria-label="Salary column" style={{ color: 'var(--text)', overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
      <caption style={{ textAlign: 'left', fontWeight: 600, padding: '4px 0 8px', color: 'var(--text)' }}>DataFrame employees</caption>
      <thead><tr>
        <th scope="col" style={cell}>row</th>
        <th scope="col" style={{ ...cell, color: 'var(--text-muted)' }}>name (kept)</th>
        <th scope="col" style={{ ...cell, background: 'var(--surface2)' }}>salary</th>
        <th scope="col" style={cell}>was</th>
        <th scope="col" style={{ ...cell, width: '38%' }}>original + added</th>
      </tr></thead>
      <tbody>{rows.length ? rows.map((row, i) => {
        const state = stateOf(i)
        const active = i === step.at
        const oldShare = Math.abs(row.salary) / peak * 100
        return <tr key={i} data-index={i} data-state={state} style={{ outline: active ? '2px solid var(--primary)' : 'none', outlineOffset: -2 }}>
          <td style={cell}>{i}</td>
          <td style={{ ...cell, color: 'var(--text-muted)' }}>{row.name}</td>
          <td style={{ ...cell, background: 'var(--surface2)', fontWeight: state === 'written' ? 700 : 400 }} data-salary={step.salaries[i]}>{step.salaries[i]}</td>
          <td style={cell}>{state === 'written' ? `${row.salary} × 2` : stateLabel[state]}</td>
          <td style={cell}>
            <div role="img" aria-label={state === 'written' ? `${row.salary} plus ${row.salary}` : `${row.salary}`} style={{ display: 'flex', height: 14, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <span style={{ width: `${oldShare}%`, background: 'var(--primary)' }} />
              {state === 'written' && <span style={{ width: `${oldShare}%`, background: 'var(--success)' }} />}
            </div>
          </td>
        </tr>
      }) : <tr><td colSpan={5} style={cell}>No rows: the frame comes back empty, with the same two columns.</td></tr>}</tbody>
    </table>
    <output aria-label="Rows doubled" style={{ display: 'block', marginTop: 10, color: 'var(--text)' }}>{`Rows doubled: ${step.written} of ${rows.length}`}</output>
  </section>
}
