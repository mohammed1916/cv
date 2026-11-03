import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with an Employees table (employee_id, name, salary)'
const complexity = 'O(n log n) over the employee rows because the visual sorts teams. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({ Employees: [{ employee_id: 1, name: 'Alice', salary: 100 }, { employee_id: 2, name: 'Bob', salary: 200 }, { employee_id: 3, name: 'Carol', salary: 100 }, { employee_id: 4, name: 'Dan', salary: 300 }, { employee_id: 5, name: 'Eve', salary: 200 }, { employee_id: 6, name: 'Frank', salary: 400 }] }) },
]

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

export default function SharedSalaryTeamsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>First keep only salaries that occur at least twice. Each remaining salary gets the next team number in ascending order, and every employee on that salary inherits it.</p>} />
}
