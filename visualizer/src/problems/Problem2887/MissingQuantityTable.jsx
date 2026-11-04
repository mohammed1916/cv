const cell = { padding: '6px 10px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text)' }

// One row per product: quantity on arrival, the isna() mask, then quantity after filling.
export default function MissingQuantityTable({ run, step }) {
  const before = run.input.products
  const show = value => (value === null ? 'None' : String(value))
  const filledCount = step.filled.length
  const missingCount = step.mask.filter(Boolean).length
  return <section aria-label="Product table" style={{ color: 'var(--text)', display: 'grid', gap: 12 }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 460 }}>
        <thead><tr style={{ background: 'var(--surface3)' }}>
          {['#', 'name', 'quantity on arrival', 'isna()', 'quantity now', 'price'].map(h => <th key={h} scope="col" style={cell}>{h}</th>)}
        </tr></thead>
        <tbody>{before.map((row, i) => {
          const active = i === step.active
          const isMissing = row.quantity === null
          const masked = i < step.mask.length
          const wasFilled = step.filled.includes(i)
          const outline = active ? { outline: '3px solid var(--primary)', outlineOffset: -3 } : {}
          return <tr key={i} data-row={i} data-active={active || undefined} style={{ background: active ? 'var(--primary-glow)' : 'transparent' }}>
            <td style={cell}>{i}</td>
            <td style={cell}>{row.name}</td>
            <td style={{ ...cell, background: isMissing ? 'var(--error-glow)' : 'transparent', fontWeight: isMissing ? 700 : 400, ...(step.phase === 'mask' ? outline : {}) }}>{show(row.quantity)}</td>
            <td data-mask={masked ? String(step.mask[i]) : undefined} style={{ ...cell, fontFamily: 'monospace', background: masked && step.mask[i] ? 'var(--warning-glow)' : 'transparent' }}>{masked ? (step.mask[i] ? 'True' : 'False') : '·'}</td>
            <td style={{ ...cell, background: wasFilled ? 'var(--success-glow)' : isMissing ? 'var(--error-glow)' : 'transparent', fontWeight: wasFilled ? 700 : 400, ...(step.phase === 'fill' ? outline : {}) }}>
              {wasFilled ? <>None <span aria-hidden="true">➜</span> 0</> : show(step.rows[i].quantity)}
            </td>
            <td style={cell}>{show(row.price)}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
    <dl style={{ display: 'flex', flexWrap: 'wrap', gap: 20, margin: 0 }}>
      <div><dt style={{ color: 'var(--text-muted)' }}>rows checked</dt><dd style={{ margin: 0, fontWeight: 700 }}>{step.mask.length} of {before.length}</dd></div>
      <div><dt style={{ color: 'var(--text-muted)' }}>missing found</dt><dd style={{ margin: 0, fontWeight: 700 }}>{missingCount}</dd></div>
      <div><dt style={{ color: 'var(--text-muted)' }}>filled with 0</dt><dd style={{ margin: 0, fontWeight: 700 }}>{filledCount}</dd></div>
    </dl>
  </section>
}
