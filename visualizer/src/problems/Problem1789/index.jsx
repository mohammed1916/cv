import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of Employee rows'
const complexity = 'Counts each employee once, then keeps the rows that pass the flag or single-department test. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"employee_id":1,"department_id":10,"primary_flag":"N"},{"employee_id":2,"department_id":20,"primary_flag":"Y"},{"employee_id":2,"department_id":30,"primary_flag":"N"},{"employee_id":3,"department_id":40,"primary_flag":"N"},{"employee_id":3,"department_id":50,"primary_flag":"Y"},{"employee_id":4,"department_id":60,"primary_flag":"Y"}]',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

// Each association row with the test it goes through: Y flag, or the only department of its employee.
export default function PrimaryDepartmentVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const checkedId = step.phase === 'check' ? step.rows[step.rows.length - 1]?.employee_id : null
    const decided = step.phase === 'check' ? new Map(step.rows.map(r => [`${r.employee_id}:${r.department_id}`, r.kept])) : null
    const single = new Set(run.input.map(r => r.employee_id).filter((id, i, all) => all.filter(x => x === id).length === 1))
    return <>
      <p style={{ margin: '0 0 8px' }}>{step.message}</p>
      <table aria-label="Employee departments" style={{ borderCollapse: 'collapse' }}>
        <thead><tr>{['employee_id', 'department_id', 'primary_flag', 'test', 'kept'].map(c => <th key={c} scope="col" style={CELL}>{c}</th>)}</tr></thead>
        <tbody>{run.input.map((row, i) => {
          const key = `${row.employee_id}:${row.department_id}`
          const kept = decided && decided.has(key) ? decided.get(key) : null
          const test = row.primary_flag === 'Y' ? 'flag Y' : single.has(row.employee_id) ? 'only department' : 'not primary'
          return <tr key={i} style={{ background: row.employee_id === checkedId ? 'var(--surface2)' : undefined, opacity: kept === 'no' ? 0.55 : 1 }}>
            <td style={CELL}>{row.employee_id}</td><td style={CELL}>{row.department_id}</td><td style={CELL}>{row.primary_flag}</td>
            <td style={CELL}>{test}</td>
            <td style={{ ...CELL, fontWeight: kept === 'yes' ? 700 : 400 }}>{kept ?? '-'}</td>
          </tr>
        })}</tbody>
      </table>
      {step.phase === 'done' && <table aria-label="Result" style={{ borderCollapse: 'collapse', marginTop: 10 }}>
        <thead><tr><th style={CELL}>employee_id</th><th style={CELL}>department_id</th></tr></thead>
        <tbody>{step.rows.map((r, i) => <tr key={i}><td style={CELL}>{r.employee_id}</td><td style={CELL}>{r.department_id}</td></tr>)}</tbody>
      </table>}
    </>
  }} renderReasoning={() => <p>An employee with one association keeps it whatever its flag. An employee with several keeps the row flagged Y, so the output has exactly one department per employee.</p>} />
}
