import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const phases = [
  { id: 'load', label: 'Employees', description: 'Read every employee and who they report to.' },
  { id: 'scan', label: 'Managers', description: 'Gather the direct reports of each manager and average their ages.' },
  { id: 'done', label: 'Result', description: 'Return managers with at least one direct report.' },
]

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption style={{ textAlign: 'left', color: 'var(--text)', marginBottom: 4 }}>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

// Each manager with the employees who report to them. The manager being summarised is highlighted.
function ReportGroups({ employees, currentId }) {
  const managers = employees.filter(m => employees.some(e => e.reports_to === m.employee_id))
  if (managers.length === 0) return <p style={{ color: 'var(--text-muted, var(--text))' }}>No one has a direct report in this table.</p>
  return <div aria-label="Direct reports by manager" style={{ display: 'grid', gap: 8 }}>
    {managers.map(manager => {
      const reports = employees.filter(e => e.reports_to === manager.employee_id)
      const current = manager.employee_id === currentId
      return <div key={manager.employee_id} style={{ padding: '6px 8px', borderRadius: 8, border: `2px solid ${current ? 'var(--primary)' : 'var(--border)'}`, background: current ? 'var(--surface2)' : 'transparent' }}>
        <strong style={{ color: 'var(--text)' }}>{manager.name}</strong>
        <span style={{ marginLeft: 8, fontFamily: 'monospace', color: 'var(--text-muted, var(--text))' }}>{reports.length} direct report{reports.length === 1 ? '' : 's'}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {reports.map(r => <span key={r.employee_id} style={{ padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 13 }}>{r.name}, age {r.age}</span>)}
        </div>
      </div>
    })}
  </div>
}

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with an Employees list of { employee_id, name, reports_to (id or null), age } rows',
  url: 'https://leetcode.com/problems/the-number-of-employees-which-report-to-each-employee/',
  complexity: 'O(n * m) in this teaching trace for clarity; SQL groups the self-join in one pass.',
  examples: [
    { label: 'Example', input: '{"Employees":[{"employee_id":1,"name":"Ava","reports_to":null,"age":40},{"employee_id":2,"name":"Ben","reports_to":1,"age":20},{"employee_id":3,"name":"Cy","reports_to":1,"age":21},{"employee_id":4,"name":"Dee","reports_to":2,"age":30},{"employee_id":5,"name":"Eli","reports_to":2,"age":33},{"employee_id":6,"name":"Fay","reports_to":null,"age":25}]}' },
  ],
}

export default function NumberOfEmployeesWhichReportToEachEmployee() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const currentRow = step.phase === 'scan' ? step.rows[step.rows.length - 1] : null
    return <>
      <p>{step.message}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px' }}><ReportGroups employees={run.input.Employees} currentId={currentRow ? currentRow.employee_id : null} /></div>
        <TableView caption="Result rows so far" columns={step.columns} rows={step.rows} />
      </div>
    </>
  }} renderReasoning={() => <>
    <p>Each employee joins to their manager. An average of 20.5 rounds half up to 21, which is why the trace uses floor(x + 0.5) rather than the default banker's rounding.</p>
  </>} />
}
