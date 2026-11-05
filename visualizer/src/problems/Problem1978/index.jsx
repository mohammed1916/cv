import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const definition = {
  number: '1978',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  sql,
  inputLabel: 'JSON object with employees: [employee_id, name, manager_id or null, salary]',
  url: 'https://leetcode.com/problems/employees-whose-manager-left-the-company/',
  complexity: 'O(e) with a hash set of IDs for the manager check. A database runs a filter and an anti-join.',
  examples: [
    { label: 'One affected', input: '{"employees":[[1,"Kalel",11,20000],[11,"Joziah",6,40000],[6,"Ann",null,90000],[7,"Bo",8,10000]]}' },
    { label: 'None affected', input: '{"employees":[[3,"Cy",9,10000],[9,"Di",null,80000]]}' },
  ],
}

export default function Problem1978Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <p>Stage: <strong>{step.stage}</strong></p>
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
