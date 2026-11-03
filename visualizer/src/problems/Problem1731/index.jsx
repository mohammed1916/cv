import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const phases = [
  { id: 'load', label: 'Employees', description: 'Read every employee and who they report to.' },
  { id: 'scan', label: 'Managers', description: 'Gather the direct reports of each manager and average their ages.' },
  { id: 'done', label: 'Result', description: 'Return managers with at least one direct report.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Each employee joins to their manager. An average of 20.5 rounds half up to 21, which is why the trace uses floor(x + 0.5) rather than the default banker's rounding.</p>
  </>} />
}
