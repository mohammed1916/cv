import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = {
  "Salary": [
    {
      "employee_id": 3,
      "name": "Cara",
      "salary": 2000
    },
    {
      "employee_id": 2,
      "name": "Bob",
      "salary": 800
    },
    {
      "employee_id": 3,
      "name": "Cara",
      "salary": 2600
    },
    {
      "employee_id": 1,
      "name": "Alice",
      "salary": 1000
    },
    {
      "employee_id": 1,
      "name": "Alice",
      "salary": 1500
    }
  ]
}

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel: 'JSON object with a Salary table',
  complexity: 'Linear in the salary records: one pass for each employee maximum and one pass to keep the matching rows.',
  examples: [
    { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
    { label: 'Single row', input: '{"Salary":[{"employee_id":1,"name":"Ada","salary":5000}]}' },
    { label: 'Equal salaries tie', input: '{"Salary":[{"employee_id":1,"name":"Ann","salary":3000},{"employee_id":2,"name":"Bo","salary":3000},{"employee_id":3,"name":"Cy","salary":1000}]}' },
    { label: 'Long run: 14 rows', input: '{"Salary":[{"employee_id":1,"name":"Ava","salary":2100},{"employee_id":2,"name":"Ben","salary":4300},{"employee_id":3,"name":"Cara","salary":1500},{"employee_id":4,"name":"Dan","salary":4300},{"employee_id":5,"name":"Eva","salary":2500},{"employee_id":6,"name":"Finn","salary":900},{"employee_id":7,"name":"Gia","salary":3100},{"employee_id":8,"name":"Hal","salary":4700},{"employee_id":9,"name":"Ivy","salary":2100},{"employee_id":10,"name":"Jon","salary":3900},{"employee_id":11,"name":"Kai","salary":1200},{"employee_id":12,"name":"Lea","salary":4700},{"employee_id":13,"name":"Max","salary":2800},{"employee_id":14,"name":"Nia","salary":3300}]}' },
  ],
}

function Table({ columns, rows, empty }) {
  if (!rows.length) return <p>{empty}</p>
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function Problem2668() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="No salary records to report." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Repeated rows for one employee are raises, so the largest salary is the latest one. The model keeps the row that carries each employee top salary.</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization.</p>
    </>} />
}
