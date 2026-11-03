import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const COLUMNS = ['emp_id', 'name', 'salary', 'dept']

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with an employees table (emp_id, name, salary, dept)',
  url: 'https://leetcode.com/problems/second-highest-salary-ii/description/',
  complexity: 'Teaching model: one pass to group, then one sort per department. Visualization caps the table at 12 rows.',
  examples: [
    { label: 'Example', input: '{"employees":[{"emp_id":1,"name":"Ana","salary":900,"dept":"Eng"},{"emp_id":2,"name":"Bo","salary":700,"dept":"Eng"},{"emp_id":3,"name":"Cy","salary":700,"dept":"Eng"},{"emp_id":4,"name":"Di","salary":500,"dept":"Ops"},{"emp_id":5,"name":"Ed","salary":800,"dept":"Ops"},{"emp_id":6,"name":"Fay","salary":900,"dept":"Eng"},{"emp_id":7,"name":"Gil","salary":400,"dept":"Solo"}]}' },
  ],
}

function RowTable({ rows, columns }) {
  return <table className="problem-table">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>No rows</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function Problem3338() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable rows={step.rows} columns={step.rows[0] && 'rnk' in step.rows[0] ? [...COLUMNS, 'rnk'] : COLUMNS} />
    <output aria-label="Current state">{step.result ? 'Result ready' : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Dense ranking gives equal salaries the same rank, so the second distinct salary is always rank 2 even when several people tie at the top.</p>
    <p>Departments with a single distinct salary never receive rank 2, which is why they disappear from the result.</p>
  </>} />
}
