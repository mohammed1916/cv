import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = "JSON object with a Salaries table"
const complexity = "One pass over the salary rows, plus constant work to combine the two department maxima."
const SAMPLE = {
  "Salaries": [
    {
      "employee_id": 1,
      "employee_name": "Ana",
      "salary": 5200,
      "department": "Marketing"
    },
    {
      "employee_id": 2,
      "employee_name": "Ben",
      "salary": 7100,
      "department": "Engineering"
    },
    {
      "employee_id": 3,
      "employee_name": "Cara",
      "salary": 6400,
      "department": "Marketing"
    },
    {
      "employee_id": 4,
      "employee_name": "Dev",
      "salary": 6900,
      "department": "Engineering"
    },
    {
      "employee_id": 5,
      "employee_name": "Eli",
      "salary": 9000,
      "department": "Sales"
    },
    {
      "employee_id": 6,
      "employee_name": "Fay",
      "salary": 7300,
      "department": "Engineering"
    }
  ]
}
const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: "Equal top salaries", input: "{\"Salaries\":[{\"employee_id\":1,\"employee_name\":\"Ann\",\"salary\":70,\"department\":\"Marketing\"},{\"employee_id\":2,\"employee_name\":\"Ben\",\"salary\":70,\"department\":\"Marketing\"},{\"employee_id\":3,\"employee_name\":\"Cy\",\"salary\":70,\"department\":\"Engineering\"}]}" },
  { label: "Single row per department", input: "{\"Salaries\":[{\"employee_id\":4,\"employee_name\":\"Di\",\"salary\":10,\"department\":\"Marketing\"},{\"employee_id\":5,\"employee_name\":\"Ed\",\"salary\":20,\"department\":\"Engineering\"}]}" },
  { label: "Zero salary", input: "{\"Salaries\":[{\"employee_id\":6,\"employee_name\":\"Fay\",\"salary\":0,\"department\":\"Marketing\"},{\"employee_id\":7,\"employee_name\":\"Gus\",\"salary\":0,\"department\":\"Engineering\"}]}" },
  { label: "Long run: 12 seeded salaries", input: "{\"Salaries\":[{\"employee_id\":1,\"employee_name\":\"E1\",\"salary\":6300,\"department\":\"Engineering\"},{\"employee_id\":2,\"employee_name\":\"E2\",\"salary\":2900,\"department\":\"Marketing\"},{\"employee_id\":3,\"employee_name\":\"E3\",\"salary\":1100,\"department\":\"Engineering\"},{\"employee_id\":4,\"employee_name\":\"E4\",\"salary\":3100,\"department\":\"Marketing\"},{\"employee_id\":5,\"employee_name\":\"E5\",\"salary\":1400,\"department\":\"Engineering\"},{\"employee_id\":6,\"employee_name\":\"E6\",\"salary\":9000,\"department\":\"Marketing\"},{\"employee_id\":7,\"employee_name\":\"E7\",\"salary\":1200,\"department\":\"Engineering\"},{\"employee_id\":8,\"employee_name\":\"E8\",\"salary\":6600,\"department\":\"Marketing\"},{\"employee_id\":9,\"employee_name\":\"E9\",\"salary\":1500,\"department\":\"Engineering\"},{\"employee_id\":10,\"employee_name\":\"E10\",\"salary\":7600,\"department\":\"Marketing\"},{\"employee_id\":11,\"employee_name\":\"E11\",\"salary\":8100,\"department\":\"Engineering\"},{\"employee_id\":12,\"employee_name\":\"E12\",\"salary\":7800,\"department\":\"Marketing\"}]}" },
]

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
