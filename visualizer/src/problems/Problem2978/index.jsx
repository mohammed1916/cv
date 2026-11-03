import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = "JSON object with a Coordinates table"
const complexity = "One grouping pass, then a partner lookup per distinct point; the teaching trace uses plain scans for clarity."
const SAMPLE = {
  "Coordinates": [
    {
      "X": 1,
      "Y": 2
    },
    {
      "X": 2,
      "Y": 1
    },
    {
      "X": 3,
      "Y": 3
    },
    {
      "X": 4,
      "Y": 4
    },
    {
      "X": 4,
      "Y": 4
    },
    {
      "X": 5,
      "Y": 6
    },
    {
      "X": 6,
      "Y": 5
    },
    {
      "X": 7,
      "Y": 8
    },
    {
      "X": 9,
      "Y": 9
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
