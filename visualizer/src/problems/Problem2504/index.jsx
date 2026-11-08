import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = {
  "Person": [
    {
      "person_id": 5,
      "name": "Eli",
      "profession": "Writer"
    },
    {
      "person_id": 2,
      "name": "Bob",
      "profession": "Doctor"
    },
    {
      "person_id": 7,
      "name": "Ann",
      "profession": "Chef"
    },
    {
      "person_id": 3,
      "name": "Carl",
      "profession": "Teacher"
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
  inputLabel: 'JSON object with a Person table',
  complexity: 'Linear in the number of people, plus one sort by person_id.',
  examples: [
    { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
    { label: 'Single person', input: '{"Person":[{"person_id":1,"name":"Amy","profession":"Nurse"}]}' },
    { label: 'Same display name', input: '{"Person":[{"person_id":3,"name":"Ann","profession":"Chef"},{"person_id":9,"name":"Ann","profession":"Chef"}]}' },
    { label: 'Largest table, ids out of order', input: '{"Person":[{"person_id":1000,"name":"Ann","profession":"Chef"},{"person_id":963,"name":"Bob","profession":"Doctor"},{"person_id":926,"name":"Cara","profession":"Writer"},{"person_id":889,"name":"Dan","profession":"Pilot"},{"person_id":852,"name":"Eve","profession":"Nurse"},{"person_id":815,"name":"Finn","profession":"Judge"},{"person_id":778,"name":"Gia","profession":"Farmer"},{"person_id":741,"name":"Hal","profession":"Chef"},{"person_id":704,"name":"Ivy","profession":"Doctor"},{"person_id":667,"name":"Jon","profession":"Writer"},{"person_id":630,"name":"Kay","profession":"Pilot"},{"person_id":593,"name":"Leo","profession":"Nurse"},{"person_id":556,"name":"Mia","profession":"Judge"},{"person_id":519,"name":"Ned","profession":"Farmer"}]}' },
    { label: 'Long run: 14 people', input: '{"Person":[{"person_id":1,"name":"Mia","profession":"Doctor"},{"person_id":6,"name":"Jon","profession":"Writer"},{"person_id":11,"name":"Dan","profession":"Farmer"},{"person_id":2,"name":"Eve","profession":"Chef"},{"person_id":7,"name":"Mia","profession":"Pilot"},{"person_id":12,"name":"Mia","profession":"Farmer"},{"person_id":3,"name":"Eve","profession":"Doctor"},{"person_id":8,"name":"Ivy","profession":"Judge"},{"person_id":13,"name":"Bob","profession":"Farmer"},{"person_id":4,"name":"Cara","profession":"Writer"},{"person_id":9,"name":"Eve","profession":"Pilot"},{"person_id":14,"name":"Ann","profession":"Nurse"},{"person_id":5,"name":"Kay","profession":"Judge"},{"person_id":10,"name":"Cara","profession":"Pilot"}]}' },
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

export default function Problem2504() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="No people to list." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Each display name is the name, then the first letter of the profession inside brackets. The rows are listed by person_id, largest first.</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization.</p>
    </>} />
}
