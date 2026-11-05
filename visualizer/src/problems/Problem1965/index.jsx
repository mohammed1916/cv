import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const definition = {
  number: '1965',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  sql,
  inputLabel: 'JSON object with employees [id, name or null] and salaries [id, salary]',
  url: 'https://leetcode.com/problems/employees-with-missing-information/',
  complexity: 'O(e + s) with hash sets for the lookups. A database runs the two outer joins and a union.',
  examples: [
    { label: 'Missing name and salary', input: '{"employees":[[2,"Ann"],[3,null],[4,"Bo"]],"salaries":[[2,5000],[4,700]]}' },
    { label: 'Salary without employee', input: '{"employees":[[1,"Cy"]],"salaries":[[9,300]]}' },
  ],
}

export default function Problem1965Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <p>Stage: <strong>{step.stage}</strong></p>
      {step.side && <table aria-label="Salaries table" style={{ borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead><tr><th style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>employee_id</th><th style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>salary</th></tr></thead>
        <tbody>{step.side.map((r, i) => <tr key={i}>{r.map((v, k) => <td key={k} style={{ padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>{String(v)}</td>)}</tr>)}</tbody>
      </table>}
      <table aria-label={`Rows after ${step.stage}`} style={{ borderCollapse: 'collapse' }}>
        <thead><tr>{step.cols.map(c => <th key={c} style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>{c}</th>)}</tr></thead>
        <tbody>
          {step.rows.length === 0 && <tr><td colSpan={step.cols.length}><em>no rows</em></td></tr>}
          {step.rows.map((row, i) => <tr key={i}>{row.map((v, k) => <td key={k} style={{ padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>{String(v)}</td>)}</tr>)}
        </tbody>
      </table>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
