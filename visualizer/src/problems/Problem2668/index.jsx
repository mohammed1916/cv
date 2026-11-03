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
  examples: [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }],
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
