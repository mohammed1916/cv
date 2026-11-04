import HashMapView from '../../components/shared/HashMapView'
import RecordStateTable from '../../components/shared/RecordStateTable'

const COLUMNS = ['customer_id', 'name', 'email']
const cell = { padding: '6px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'inherit' }

function decisionText(step, position) {
  if (step.decisions[position] === 'keep') return 'kept'
  if (step.decisions[position] === 'drop') return 'dropped'
  if (position === step.at) return 'checking'
  if (position === step.firstRow) return 'first use'
  return 'waiting'
}

function rowStyle(step, position) {
  const decision = step.decisions[position]
  const accent = position === step.at ? 'var(--primary)'
    : position === step.firstRow ? 'var(--warning)'
      : decision === 'keep' ? 'var(--success)'
        : decision === 'drop' ? 'var(--error)' : 'transparent'
  return {
    boxShadow: `inset 4px 0 0 ${accent}`,
    background: position === step.at || position === step.firstRow ? 'var(--surface3)' : 'var(--surface2)',
    color: decision === 'drop' ? 'var(--text-muted)' : 'var(--text)',
    textDecoration: decision === 'drop' ? 'line-through' : 'none',
  }
}

// The frame as a table: which row is read, which earlier row it collides with, and what has been decided.
export default function EmailDedupeView({ run, step }) {
  const customers = run.input.customers
  const kept = customers.filter((_, position) => step.decisions[position] === 'keep')
  const activeEmail = step.at >= 0 ? customers[step.at].email : null
  return <section aria-label="Duplicate email removal" style={{ display: 'grid', gap: 16, color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}>
      <table aria-label="customers DataFrame" style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
        <caption style={{ textAlign: 'left', fontWeight: 600, paddingBottom: 6 }}>customers, read from the top</caption>
        <thead><tr>{['row', ...COLUMNS, 'decision'].map(name => <th key={name} scope="col" style={cell}>{name}</th>)}</tr></thead>
        <tbody>
          {customers.length === 0 && <tr><td style={cell} colSpan={COLUMNS.length + 2}>No rows</td></tr>}
          {customers.map((row, position) => <tr key={position} data-row={position} data-decision={step.decisions[position] ?? 'open'} style={rowStyle(step, position)}>
            <td style={cell}>{position}</td>
            <td style={cell}>{row.customer_id}</td>
            <td style={cell}>{row.name}</td>
            <td style={{ ...cell, fontWeight: row.email === activeEmail ? 700 : 400 }}>{row.email}</td>
            <td style={{ ...cell, textDecoration: 'none' }}>{decisionText(step, position)}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <HashMapView maps={step.hash.maps} ops={step.hash.ops} skipped={step.hash.skipped} />
    <RecordStateTable label={`Kept so far (${kept.length} of ${customers.length})`} columns={COLUMNS} rows={kept} />
  </section>
}
