import RecordStateTable from '../../components/shared/RecordStateTable'
import { QUARTERS } from './algorithm'

const cell = { padding: '6px 10px', border: '1px solid var(--border)', textAlign: 'right', color: 'var(--text)' }

// The wide table on the left drains cell by cell into the long table on the right.
export default function MeltView({ run, step }) {
  const { report } = run.input
  const used = new Set(step.consumed)
  const styleFor = (rowIndex, quarter) => {
    const isActive = rowIndex === step.rowIndex && quarter === step.quarter
    const isUsed = used.has(`${rowIndex}:${quarter}`)
    return {
      ...cell,
      fontWeight: isActive ? 700 : 400,
      outline: isActive ? '3px solid var(--primary)' : 'none',
      outlineOffset: -3,
      opacity: isUsed && !isActive ? 0.45 : 1,
      background: quarter === step.quarter ? 'color-mix(in srgb, var(--primary) 14%, var(--surface2))' : 'var(--surface)',
    }
  }
  const total = report.length * QUARTERS.length
  return <section aria-label="Wide table melting into a long table" style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--text)' }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <caption style={{ textAlign: 'left', fontWeight: 600, padding: '6px 0' }}>Wide table: report (faded cells are already written)</caption>
        <thead><tr>
          <th scope="col" style={{ ...cell, textAlign: 'left', background: 'var(--surface2)' }}>product</th>
          {QUARTERS.map(quarter => <th key={quarter} scope="col" data-quarter={quarter} style={{ ...cell, background: quarter === step.quarter ? 'color-mix(in srgb, var(--primary) 30%, var(--surface2))' : 'var(--surface2)' }}>{quarter}</th>)}
        </tr></thead>
        <tbody>
          {report.length ? report.map((row, rowIndex) => <tr key={rowIndex}>
            <th scope="row" style={{ ...cell, textAlign: 'left', background: rowIndex === step.rowIndex ? 'color-mix(in srgb, var(--primary) 30%, var(--surface2))' : 'var(--surface)' }}>{row.product}</th>
            {QUARTERS.map(quarter => <td key={quarter} data-cell={`${rowIndex}:${quarter}`} style={styleFor(rowIndex, quarter)}>{row[quarter]}</td>)}
          </tr>) : <tr><td colSpan={5} style={cell}>No rows, so nothing will be written</td></tr>}
        </tbody>
      </table>
    </div>
    <div aria-label="Values being carried" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, minHeight: 40 }}>
      <span>carrying</span>
      {[['product', step.carry?.product], ['quarter', step.carry?.quarter ?? step.quarter], ['sales', step.carry?.sales]].map(([name, value]) => <span key={name} style={{ padding: '4px 10px', borderRadius: 6, border: '2px solid var(--border)', background: 'var(--surface2)', borderColor: value !== undefined && value !== null ? 'var(--primary)' : 'var(--border)' }}>
        <small style={{ color: 'var(--text-secondary)' }}>{name} </small><strong>{value ?? '–'}</strong>
      </span>)}
      <span aria-hidden="true">{step.phase === 'append' ? '↓ written below' : ''}</span>
    </div>
    <RecordStateTable label={`Long table: ${step.output.length} of ${total} rows`} columns={['product', 'quarter', 'sales']} rows={step.output} activeRow={step.activeOutput} />
  </section>
}
