import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { orders: [
  { order_id: 1, customer_id: 1, order_date: '2019-03-01', price: 40 },
  { order_id: 2, customer_id: 1, order_date: '2019-07-01', price: 60 },
  { order_id: 3, customer_id: 1, order_date: '2020-02-01', price: 150 },
  { order_id: 4, customer_id: 1, order_date: '2021-05-01', price: 120 },
  { order_id: 5, customer_id: 2, order_date: '2019-01-15', price: 50 },
  { order_id: 6, customer_id: 2, order_date: '2020-06-01', price: 80 },
  { order_id: 7, customer_id: 2, order_date: '2021-09-01', price: 90 },
  { order_id: 8, customer_id: 3, order_date: '2019-04-01', price: 70 },
  { order_id: 9, customer_id: 3, order_date: '2021-04-01', price: 200 },
  { order_id: 10, customer_id: 4, order_date: '2020-08-01', price: 30 },
] }

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel: 'JSON object with an orders table',
  complexity: 'Linear in the order rows, plus one pass over each customer\'s yearly totals.',
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

export default function Problem2474() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="No customer keeps a strictly increasing history." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Each year is compared only with the year directly before it. A missing year breaks the chain, and a customer with a single year does not qualify in this teaching model.</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization.</p>
    </>} />
}
