import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with an Employees table (employee_id, name, salary)'
const complexity = 'O(n log n) over the employee rows because the visual sorts teams. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({ Employees: [{ employee_id: 1, name: 'Alice', salary: 100 }, { employee_id: 2, name: 'Bob', salary: 200 }, { employee_id: 3, name: 'Carol', salary: 100 }, { employee_id: 4, name: 'Dan', salary: 300 }, { employee_id: 5, name: 'Eve', salary: 200 }, { employee_id: 6, name: 'Frank', salary: 400 }] }) },
  { label: 'Single employee', input: "{\"Employees\":[{\"employee_id\":1,\"name\":\"Solo\",\"salary\":1}]}" },
  { label: 'Equal salaries', input: "{\"Employees\":[{\"employee_id\":1,\"name\":\"Ann\",\"salary\":500},{\"employee_id\":2,\"name\":\"Ben\",\"salary\":500},{\"employee_id\":3,\"name\":\"Cy\",\"salary\":500}]}" },
  { label: 'Largest id and salary', input: "{\"Employees\":[{\"employee_id\":99,\"name\":\"Max\",\"salary\":1000}]}" },
  { label: 'Long run: 12 employees', input: "{\"Employees\":[{\"employee_id\":1,\"name\":\"Staff 1\",\"salary\":593},{\"employee_id\":2,\"name\":\"Staff 2\",\"salary\":942},{\"employee_id\":3,\"name\":\"Staff 3\",\"salary\":538},{\"employee_id\":4,\"name\":\"Staff 4\",\"salary\":134},{\"employee_id\":5,\"name\":\"Staff 5\",\"salary\":878},{\"employee_id\":6,\"name\":\"Staff 6\",\"salary\":666},{\"employee_id\":7,\"name\":\"Staff 7\",\"salary\":689},{\"employee_id\":8,\"name\":\"Staff 8\",\"salary\":910},{\"employee_id\":9,\"name\":\"Staff 9\",\"salary\":354},{\"employee_id\":10,\"name\":\"Staff 10\",\"salary\":117},{\"employee_id\":11,\"name\":\"Staff 11\",\"salary\":493},{\"employee_id\":12,\"name\":\"Staff 12\",\"salary\":604}]}" },
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
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>First keep only salaries that occur at least twice. Each remaining salary gets the next team number in ascending order, and every employee on that salary inherits it.</p>} />
}
