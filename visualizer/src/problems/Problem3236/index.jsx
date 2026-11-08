import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { Employees: [
  { employee_id: 1, employee_name: "Ana", manager_id: null, salary: 900 },
  { employee_id: 2, employee_name: "Ben", manager_id: 1, salary: 500 },
  { employee_id: 3, employee_name: "Cy", manager_id: 1, salary: 450 },
  { employee_id: 4, employee_name: "Di", manager_id: 2, salary: 300 },
  { employee_id: 5, employee_name: "Ed", manager_id: 2, salary: 320 },
  { employee_id: 6, employee_name: "Fay", manager_id: 4, salary: 200 },
] }
const inputLabel = 'JSON object with an Employees table (employee_id, employee_name, manager_id, salary; one row has a null manager)'
const complexity = 'Each employee is visited once while walking the tree and once while counting below: O(n) with a per-person count, O(n^2) in the worst case.'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'Only the CEO', input: '{"Employees":[{"employee_id":1,"employee_name":"Ada","manager_id":null,"salary":100}]}' },
  { label: 'Two reports under one manager', input: '{"Employees":[{"employee_id":1,"employee_name":"Ada","manager_id":null,"salary":100},{"employee_id":2,"employee_name":"Ben","manager_id":1,"salary":50},{"employee_id":3,"employee_name":"Cy","manager_id":1,"salary":50}]}' },
  { label: 'Long run: 12 employees', input: '{"Employees":[{"employee_id":1,"employee_name":"Emp1","manager_id":null,"salary":42},{"employee_id":2,"employee_name":"Emp2","manager_id":1,"salary":93},{"employee_id":3,"employee_name":"Emp3","manager_id":1,"salary":199},{"employee_id":4,"employee_name":"Emp4","manager_id":1,"salary":118},{"employee_id":5,"employee_name":"Emp5","manager_id":3,"salary":99},{"employee_id":6,"employee_name":"Emp6","manager_id":3,"salary":85},{"employee_id":7,"employee_name":"Emp7","manager_id":5,"salary":120},{"employee_id":8,"employee_name":"Emp8","manager_id":7,"salary":73},{"employee_id":9,"employee_name":"Emp9","manager_id":2,"salary":134},{"employee_id":10,"employee_name":"Emp10","manager_id":2,"salary":40},{"employee_id":11,"employee_name":"Emp11","manager_id":1,"salary":139},{"employee_id":12,"employee_name":"Emp12","manager_id":4,"salary":161}]}' },
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

const tableStyle = { borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem' }
const cellStyle = { border: '1px solid currentColor', padding: '0.3rem 0.5rem', textAlign: 'left' }

function Table({ columns, rows, empty }) {
  if (!rows.length) return <p>{empty}</p>
  return <div style={{ overflowX: 'auto' }}>
    <table style={tableStyle}>
      <thead><tr>{columns.map(column => <th key={column} scope="col" style={cellStyle}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cellStyle}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function CeoSubordinateHierarchy() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="The query returns no rows." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is an independently written teaching model. The sample tables were invented for this visualization.</p>
    </>} />
}
