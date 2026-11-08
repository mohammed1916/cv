import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function Grid({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={cell}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'JSON object with an employees list (employee_id, employee_name, manager_id, salary, department)',
  url: 'https://leetcode.com/problems/analyze-organization-hierarchy/description/',
  complexity: 'O(n^2) in this teaching version for n employees, since each subtree is found by walking up from every node.',
  examples: [
    { label: 'Example', input: '{"employees":[{"employee_id":1,"employee_name":"Ada","manager_id":null,"salary":300,"department":"exec"},{"employee_id":2,"employee_name":"Ben","manager_id":1,"salary":200,"department":"eng"},{"employee_id":3,"employee_name":"Cy","manager_id":1,"salary":150,"department":"ops"},{"employee_id":4,"employee_name":"Dia","manager_id":2,"salary":120,"department":"eng"},{"employee_id":5,"employee_name":"Eli","manager_id":2,"salary":90,"department":"eng"},{"employee_id":6,"employee_name":"Fay","manager_id":4,"salary":60,"department":"eng"}]}' },
    { label: 'Single', input: '{"employees":[{"employee_id":7,"employee_name":"Gus","manager_id":null,"salary":80,"department":"solo"}]}' },
    { label: 'Single employee at the top', input: '{"employees":[{"employee_id":1,"employee_name":"Staff 1","manager_id":null,"salary":0,"department":"Ops"}]}' },
    { label: 'Equal salaries in one department', input: '{"employees":[{"employee_id":1,"employee_name":"Staff 1","manager_id":null,"salary":5000,"department":"Ops"},{"employee_id":2,"employee_name":"Staff 2","manager_id":1,"salary":5000,"department":"Ops"},{"employee_id":3,"employee_name":"Staff 3","manager_id":1,"salary":5000,"department":"Ops"}]}' },
    { label: 'Largest salary integer', input: '{"employees":[{"employee_id":1,"employee_name":"Staff 1","manager_id":null,"salary":2147483647,"department":"Ops"},{"employee_id":2,"employee_name":"Staff 2","manager_id":1,"salary":0,"department":"Ops"}]}' },
    { label: 'Long run: 12 employees', input: '{"employees":[{"employee_id":1,"employee_name":"Staff 1","manager_id":null,"salary":9000,"department":"Ops"},{"employee_id":2,"employee_name":"Staff 2","manager_id":1,"salary":8139,"department":"Aps"},{"employee_id":3,"employee_name":"Staff 3","manager_id":2,"salary":5086,"department":"Dps"},{"employee_id":4,"employee_name":"Staff 4","manager_id":3,"salary":4401,"department":"Dps"},{"employee_id":5,"employee_name":"Staff 5","manager_id":1,"salary":4899,"department":"Cps"},{"employee_id":6,"employee_name":"Staff 6","manager_id":4,"salary":3770,"department":"Cps"},{"employee_id":7,"employee_name":"Staff 7","manager_id":4,"salary":8473,"department":"Aps"},{"employee_id":8,"employee_name":"Staff 8","manager_id":4,"salary":8386,"department":"Aps"},{"employee_id":9,"employee_name":"Staff 9","manager_id":8,"salary":7138,"department":"Aps"},{"employee_id":10,"employee_name":"Staff 10","manager_id":6,"salary":3497,"department":"Dps"},{"employee_id":11,"employee_name":"Staff 11","manager_id":1,"salary":8224,"department":"Dps"},{"employee_id":12,"employee_name":"Staff 12","manager_id":9,"salary":8930,"department":"Dps"}]}' },
  ],
}

function buildTree(employees) {
  const nodes = new Map(employees.map(row => [row.employee_id, { id: row.employee_id, children: [] }]))
  let root = null
  for (const row of employees) {
    if (row.manager_id === null) root = nodes.get(row.employee_id)
    else nodes.get(row.manager_id).children.push(nodes.get(row.employee_id))
  }
  return root
}

export default function Problem3482() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RootedTreeDiagram root={buildTree(run.input.employees)} title="Reporting tree" roles={{ [step.focus]: 'focus' }} />
    {Object.entries(run.input).map(([name, rows]) => <section key={name}><h3>{name} (input)</h3><Grid rows={rows} /></section>)}
    <section><h3>Computed so far</h3><Grid rows={step.rows} /></section>
    <output aria-label="Result">{`Rows returned: ${run.result.length}`}</output>
  </>} renderReasoning={() => <>
    <p>The top manager is level 1. Each employee's level comes from counting the managers above them, which is the climb through the chain.</p>
    <p>Team size and budget come from the people whose chain of managers passes through the employee, so the employee's own salary is added to theirs.</p>
  </>} />
}
