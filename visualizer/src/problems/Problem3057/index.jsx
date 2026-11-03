import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with Project and Employees lists'
const complexity = 'O(n + m) time with hash joins and one pass per team, where n is the assignment count and m the employee count.'
const examples = [
  {
    label: 'Teaching sample',
    input: JSON.stringify({
      Project: [
        { project_id: 1, employee_id: 1, workload: 40 }, { project_id: 1, employee_id: 2, workload: 20 },
        { project_id: 1, employee_id: 3, workload: 30 }, { project_id: 2, employee_id: 1, workload: 50 },
        { project_id: 2, employee_id: 4, workload: 10 }, { project_id: 2, employee_id: 5, workload: 30 },
        { project_id: 3, employee_id: 4, workload: 40 },
      ],
      Employees: [
        { employee_id: 1, name: 'Ana', team: 'core' }, { employee_id: 2, name: 'Ben', team: 'core' },
        { employee_id: 3, name: 'Cy', team: 'core' }, { employee_id: 4, name: 'Dee', team: 'web' },
        { employee_id: 5, name: 'Eli', team: 'web' },
      ],
    }),
  },
  {
    label: 'Equal workloads',
    input: JSON.stringify({
      Project: [{ project_id: 1, employee_id: 1, workload: 10 }, { project_id: 1, employee_id: 2, workload: 10 }],
      Employees: [{ employee_id: 1, name: 'A', team: 'x' }, { employee_id: 2, name: 'B', team: 'x' }],
    }),
  },
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

function RowTable({ step }) {
  const { columns, rows } = step
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.length === 0
        ? <tr><td colSpan={columns.length}>No rows</td></tr>
        : rows.map((row, index) => <tr key={index}>
          {columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}
        </tr>)}</tbody>
    </table>
  </div>
}

export default function EmployeesProjectAllocation() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <RowTable step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is a knowledge-derived teaching model. The sample tables were invented for this visualization and are not the official statement.</p>
    </>} />
}
