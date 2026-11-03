import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Employees (employee_id, needed_hours) and Logs (employee_id, in_time, out_time in seconds)'
const complexity = 'O(n + m) after grouping the log sessions by employee. The visualizer caps the tables at 12 employees and 12 logs.'
const examples = [{
  label: 'Sample',
  input: '{"Employees":[{"employee_id":1,"needed_hours":1},{"employee_id":2,"needed_hours":1},{"employee_id":3,"needed_hours":1}],"Logs":[{"employee_id":1,"in_time":0,"out_time":50},{"employee_id":1,"in_time":100,"out_time":190},{"employee_id":2,"in_time":0,"out_time":3599}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function EmployeesWithDeductions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each session is rounded up to whole minutes, then the minutes of each employee are added. An employee with no logs has a total of zero.</p>
    <p>An employee stays only when the total is strictly below the required minutes, so an exact match is dropped.</p>
  </>} />
}
