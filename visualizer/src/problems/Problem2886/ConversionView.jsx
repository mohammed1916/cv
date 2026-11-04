import RecordStateTable from '../../components/shared/RecordStateTable'
import { COLUMNS } from './algorithm'

const pill = highlighted => ({
  display: 'inline-flex', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 13, color: 'var(--text)',
  border: `${highlighted ? 2 : 1}px solid ${highlighted ? 'var(--primary)' : 'var(--border)'}`,
  background: highlighted ? 'color-mix(in srgb, var(--primary) 14%, var(--surface2))' : 'var(--surface2)',
})

// Column types above, the table before and after, and the current grade split at its decimal point.
export default function ConversionView({ step }) {
  const types = { student_id: 'int64', name: 'object', age: 'int64', grade: step.dtype }
  const c = step.conversion
  return <section aria-label="Grade column conversion" style={{ display: 'grid', gap: 14, color: 'var(--text)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} aria-label="Column types">
      {COLUMNS.map(name => <span key={name} style={pill(name === 'grade')}><strong>{name}</strong><code>{types[name]}</code></span>)}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, minHeight: 64, padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)' }} aria-label="Current grade">
      {c ? <>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>grade</span>
        <code style={{ fontSize: 26 }}>
          <span>{c.shown.split('.')[0]}</span>
          <span style={{ textDecoration: 'line-through', color: c.lost ? 'var(--error)' : 'var(--text-muted)' }}>.{c.dropped}</span>
        </code>
        <span aria-hidden="true" style={{ fontSize: 22 }}>→</span>
        <code style={{ fontSize: 26, fontWeight: 700, color: 'var(--success)' }}>{c.whole}</code>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.lost ? 'fraction is cut off, no rounding' : 'nothing of value is lost'}</span>
      </> : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step.dtype === 'int64' ? 'Every grade is converted. The column type above has changed.' : 'The grade pill above is the only float column.'}</span>}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <RecordStateTable label="Before: grade is float" columns={COLUMNS} rows={step.before} activeRow={step.at} />
      <RecordStateTable label={`After: grade is ${step.dtype === 'int64' ? 'int' : 'being converted'}`} columns={COLUMNS} rows={step.after} activeRow={step.at} />
    </div>
  </section>
}
