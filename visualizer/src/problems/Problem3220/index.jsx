import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { transactions: [
  { transaction_id: 1, amount: 3, transaction_date: "2023-11-01" },
  { transaction_id: 2, amount: 4, transaction_date: "2023-11-01" },
  { transaction_id: 3, amount: 10, transaction_date: "2023-11-01" },
  { transaction_id: 4, amount: 7, transaction_date: "2023-11-02" },
  { transaction_id: 5, amount: 8, transaction_date: "2023-11-03" },
  { transaction_id: 6, amount: 2, transaction_date: "2023-11-03" },
  { transaction_id: 7, amount: 1, transaction_date: "2023-11-05" },
  { transaction_id: 8, amount: 9, transaction_date: "2023-11-05" },
] }
const inputLabel = 'JSON object with a transactions table (transaction_id, amount as a non-negative integer, transaction_date)'
const complexity = 'One pass over the rows plus a sort of the distinct dates: O(n log n).'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'One transaction', input: '{"transactions":[{"transaction_id":1,"amount":0,"transaction_date":"2026-03-01"}]}' },
  { label: 'Equal amounts on the same day', input: '{"transactions":[{"transaction_id":1,"amount":25,"transaction_date":"2026-03-02"},{"transaction_id":2,"amount":25,"transaction_date":"2026-03-02"}]}' },
  { label: 'Long run: 12 rows', input: '{"transactions":[{"transaction_id":1,"amount":84,"transaction_date":"2026-03-01"},{"transaction_id":2,"amount":86,"transaction_date":"2026-03-02"},{"transaction_id":3,"amount":275,"transaction_date":"2026-03-03"},{"transaction_id":4,"amount":301,"transaction_date":"2026-03-04"},{"transaction_id":5,"amount":66,"transaction_date":"2026-03-05"},{"transaction_id":6,"amount":431,"transaction_date":"2026-03-01"},{"transaction_id":7,"amount":496,"transaction_date":"2026-03-02"},{"transaction_id":8,"amount":149,"transaction_date":"2026-03-03"},{"transaction_id":9,"amount":52,"transaction_date":"2026-03-04"},{"transaction_id":10,"amount":237,"transaction_date":"2026-03-05"},{"transaction_id":11,"amount":110,"transaction_date":"2026-03-01"},{"transaction_id":12,"amount":89,"transaction_date":"2026-03-02"}]}' },
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

export default function OddEvenTransactions() {
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
