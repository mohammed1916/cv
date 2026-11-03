import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = "JSON object with a Steps table"
const complexity = "Sorting by user and date, then one bounded window per row; the teaching trace uses plain scans for clarity."
const SAMPLE = {
  "Steps": [
    {
      "user_id": 1,
      "steps_count": 100,
      "steps_date": "2026-01-01"
    },
    {
      "user_id": 1,
      "steps_count": 200,
      "steps_date": "2026-01-02"
    },
    {
      "user_id": 1,
      "steps_count": 300,
      "steps_date": "2026-01-03"
    },
    {
      "user_id": 1,
      "steps_count": 400,
      "steps_date": "2026-01-05"
    },
    {
      "user_id": 2,
      "steps_count": 50,
      "steps_date": "2026-01-02"
    },
    {
      "user_id": 2,
      "steps_count": 75,
      "steps_date": "2026-01-03"
    },
    {
      "user_id": 2,
      "steps_count": 101,
      "steps_date": "2026-01-04"
    },
    {
      "user_id": 3,
      "steps_count": 10,
      "steps_date": "2026-01-10"
    }
  ]
}
const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel,
  complexity,
  examples,
}

function Table({ columns, rows }) {
  if (!rows.length) return <p>No rows at this step.</p>
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function KnowledgeDerivedSqlProblem() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is a knowledge-derived teaching model. The sample tables were invented for this visualization.</p>
    </>} />
}
