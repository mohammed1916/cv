import RecordStateTable from '../../components/shared/RecordStateTable'
import { RENAMES } from './algorithm'

const pad = { padding: '6px 10px', border: '1px solid var(--border)', textAlign: 'left' }

// The mapping as a checklist above the table: each header shows its old name struck out once renamed, and the values never move.
export default function RenameColumnsView({ run, step }) {
  const { columns } = run
  const rows = run.input.students
  const isActive = column => step.activeColumn === column
  return <section aria-label="Column renaming" style={{ display: 'grid', gap: 14, color: 'var(--text)', overflowX: 'auto' }}>
    <div role="list" aria-label="Rename mapping" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {Object.entries(RENAMES).map(([from, to]) => <div role="listitem" key={from} data-from={from} data-state={step.renamed[from] ? 'done' : isActive(from) ? 'active' : 'pending'}
        style={{ padding: '6px 10px', borderRadius: 6, background: step.renamed[from] ? 'var(--success-glow)' : isActive(from) ? 'var(--primary-glow)' : 'var(--surface2)', border: `2px solid ${isActive(from) ? 'var(--primary)' : 'var(--border)'}` }}>
        <code>{from}</code> → <code>{to}</code>{step.renamed[from] ? ' (done)' : ''}
      </div>)}
    </div>
    <table style={{ borderCollapse: 'collapse', background: 'var(--surface)' }} aria-label="Students table">
      <thead><tr>{columns.map(column => {
        const done = step.renamed[column]
        return <th key={column} scope="col" data-column={column} style={{ ...pad, background: isActive(column) ? 'var(--primary-glow)' : 'var(--surface2)' }}>
          <span style={{ display: 'block', fontWeight: done ? 400 : 700, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text)' }}>{column}</span>
          {done ? <span style={{ display: 'block', color: 'var(--success)' }}>{done}</span> : <span style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 400 }}>not renamed yet</span>}
        </th>
      })}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={{ ...pad, background: isActive(column) ? 'var(--surface2)' : 'transparent' }}>{String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={columns.length} style={{ ...pad, color: 'var(--text-muted)' }}>No rows, only headers</td></tr>}</tbody>
    </table>
    {step.showResult && <RecordStateTable label="Returned table" columns={columns.map(column => RENAMES[column])} rows={run.result} />}
  </section>
}
