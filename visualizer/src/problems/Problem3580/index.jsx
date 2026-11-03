import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const WORK_COLUMNS = ['review_id', 'employee_id', 'review_date', 'rating']
const RESULT_COLUMNS = ['employee_id', 'name', 'improvement']

function RowTable({ label, rows, columns }) {
  return (
    <section>
      <h4>{label}</h4>
      {rows.length === 0 ? <p>No rows yet.</p> : (
        <table aria-label={label}>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}</tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}

const definition = {
  number: '3580',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the employees and reviews.' },
    { id: 'group', label: 'Group', description: 'Sort each employee’s reviews newest first.' },
    { id: 'latest', label: 'Latest three', description: 'Keep the three newest reviews.' },
    { id: 'check', label: 'Check', description: 'Test for a strict rise, oldest to newest.' },
    { id: 'output', label: 'Output', description: 'Order by improvement, then name.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with employees and performance_reviews lists (one review per date for each employee)',
  url: 'https://leetcode.com/problems/find-consistently-improving-employees/description/',
  complexity: 'O(r log r) time for r reviews in this trace, dominated by sorting each employee’s reviews by date.',
  examples: [
    {
      label: 'Sample',
      input: '{"employees":[{"employee_id":1,"name":"Ana","department":"eng"},{"employee_id":2,"name":"Ben","department":"eng"},{"employee_id":3,"name":"Cara","department":"ops"},{"employee_id":4,"name":"Dev","department":"ops"}],"performance_reviews":[{"review_id":1,"employee_id":1,"review_date":"2024-01-01","rating":3},{"review_id":2,"employee_id":1,"review_date":"2024-04-01","rating":4},{"review_id":3,"employee_id":1,"review_date":"2024-07-01","rating":6},{"review_id":4,"employee_id":2,"review_date":"2024-02-01","rating":5},{"review_id":5,"employee_id":2,"review_date":"2024-05-01","rating":5},{"review_id":6,"employee_id":2,"review_date":"2024-08-01","rating":7},{"review_id":7,"employee_id":3,"review_date":"2024-01-10","rating":2},{"review_id":8,"employee_id":3,"review_date":"2024-03-10","rating":4},{"review_id":9,"employee_id":3,"review_date":"2024-06-10","rating":5},{"review_id":10,"employee_id":3,"review_date":"2024-09-10","rating":8},{"review_id":11,"employee_id":4,"review_date":"2024-05-01","rating":9}]}',
    },
    {
      label: 'Two reviews only',
      input: '{"employees":[{"employee_id":5,"name":"Eli"}],"performance_reviews":[{"review_id":12,"employee_id":5,"review_date":"2024-01-01","rating":2},{"review_id":13,"employee_id":5,"review_date":"2024-02-01","rating":6}]}',
    },
  ],
}

export default function FindConsistentlyImprovingEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable label="Working rows" rows={step.rows} columns={WORK_COLUMNS} />
    <RowTable label="Result so far" rows={step.result} columns={RESULT_COLUMNS} />
  </>} renderReasoning={() => <>
    <p>Only the three most recent reviews matter. The ratings must rise at each step from the oldest to the newest, and a repeated rating disqualifies the employee.</p>
    <p>The reported improvement is the newest of those three ratings minus the oldest of them.</p>
  </>} />
}
