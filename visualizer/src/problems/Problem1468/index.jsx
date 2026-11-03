import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Salaries', description: 'Read every employee row.' },
  { id: 'rate', label: 'Rate', description: 'Find each company maximum and choose its tax rate.' },
  { id: 'pay', label: 'Pay', description: 'Apply the rate to each employee and round.' },
  { id: 'done', label: 'Result', description: 'Return the after-tax salaries.' },
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
  number: '1468', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Salaries list of { company_id, employee_id, employee_name, salary } rows',
  url: 'https://leetcode.com/problems/calculate-salaries/',
  complexity: 'O(n) to find company maxima, plus a sort of the employees by id.',
  examples: [
    { label: 'Example', input: '{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"Alice","salary":2000},{"company_id":1,"employee_id":2,"employee_name":"Bob","salary":500},{"company_id":1,"employee_id":3,"employee_name":"Erin","salary":1001},{"company_id":2,"employee_id":4,"employee_name":"Carl","salary":15000},{"company_id":3,"employee_id":5,"employee_name":"Dan","salary":900}]}' },
  ],
}

export default function CalculateSalaries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>The company maximum picks one rate for all of its staff: under 1000 pays nothing, 1000 to 10000 pays 24 percent, and above 10000 pays 49 percent. The result is rounded half up to a whole number.</p>
  </>} />
}
