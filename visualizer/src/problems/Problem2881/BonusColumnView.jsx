const cell = { padding: '6px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }
const head = { ...cell, fontWeight: 700, background: 'var(--surface3)' }
const box = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, overflowX: 'auto' }
const title = { margin: '0 0 8px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }
const tint = token => `color-mix(in srgb, var(${token}) 22%, var(--surface))`

// The frame on the left; the salary column travelling through "times 2" on the right.
export default function BonusColumnView({ run, step }) {
  const rows = run.input.employees
  const columnTint = name => (step.focus === name ? tint('--primary') : undefined)
  const bonusTint = step.attached ? tint('--success') : undefined
  return <section aria-label="DataFrame and doubled column" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
    <div style={box}>
      <h3 style={title}>DataFrame employees</h3>
      <table style={{ borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
        <thead><tr>
          <th scope="col" style={head}>row</th>
          <th scope="col" style={{ ...head, textAlign: 'left' }}>name</th>
          <th scope="col" style={{ ...head, background: columnTint('salary') ?? head.background }}>salary</th>
          {step.attached && <th scope="col" style={{ ...head, background: bonusTint }}>bonus</th>}
        </tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index} data-row={index}>
          <th scope="row" style={{ ...cell, fontWeight: 400, color: 'var(--text-muted)' }}>{index}</th>
          <td style={{ ...cell, textAlign: 'left' }}>{row.name}</td>
          <td style={{ ...cell, background: index === step.at ? tint('--primary') : columnTint('salary'), fontWeight: index === step.at ? 700 : 400 }}>{row.salary}</td>
          {step.attached && <td style={{ ...cell, background: bonusTint, fontWeight: 700 }}>{step.doubled[index]}</td>}
        </tr>)}</tbody>
      </table>
    </div>

    <div style={box}>
      <h3 style={title}>Column arithmetic: doubled = salary × 2</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto auto', columnGap: 10, rowGap: 6, alignItems: 'center', fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
        <strong>row</strong><strong style={{ textAlign: 'right' }}>salary</strong><span /><strong /><strong style={{ textAlign: 'right' }}>doubled</strong>
        {rows.map((row, index) => {
          const value = step.doubled[index]
          const active = index === step.at
          return <div key={index} data-pipeline-row={index} data-active={active || undefined} style={{ display: 'contents' }}>
            <span style={{ color: 'var(--text-muted)' }}>{index}</span>
            <span style={{ textAlign: 'right', fontWeight: active ? 700 : 400 }}>{row.salary}</span>
            <span aria-hidden="true" style={{ color: active ? 'var(--primary)' : 'var(--text-dim)', fontWeight: active ? 700 : 400 }}>× 2</span>
            <span aria-hidden="true" style={{ color: active ? 'var(--primary)' : 'var(--text-dim)' }}>→</span>
            <span style={{ textAlign: 'right', minWidth: 72, padding: '2px 8px', borderRadius: 6, border: `1px ${value === null ? 'dashed' : 'solid'} var(--border)`, background: active ? tint('--primary') : value === null ? 'transparent' : tint('--success'), fontWeight: active ? 700 : 400 }}>{value ?? '·'}</span>
          </div>
        })}
      </div>
    </div>
  </section>
}
