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
  examples: [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }, { label: 'One order', input: '{"orders":[{"order_id":1,"customer_id":7,"order_date":"2021-03-04","price":0}]}' }, { label: 'Equal totals', input: '{"orders":[{"order_id":1,"customer_id":1,"order_date":"2020-05-01","price":5},{"order_id":2,"customer_id":2,"order_date":"2020-05-01","price":5}]}' }, { label: 'Largest set', input: '{"orders":[{"order_id":1,"customer_id":1,"order_date":"2019-01-10","price":50},{"order_id":2,"customer_id":2,"order_date":"2020-02-11","price":50},{"order_id":3,"customer_id":3,"order_date":"2021-03-12","price":50},{"order_id":4,"customer_id":1,"order_date":"2022-04-13","price":50},{"order_id":5,"customer_id":2,"order_date":"2023-05-14","price":50},{"order_id":6,"customer_id":3,"order_date":"2019-06-15","price":50},{"order_id":7,"customer_id":1,"order_date":"2020-07-16","price":50},{"order_id":8,"customer_id":2,"order_date":"2021-08-17","price":50},{"order_id":9,"customer_id":3,"order_date":"2022-09-18","price":50},{"order_id":10,"customer_id":1,"order_date":"2023-01-10","price":50},{"order_id":11,"customer_id":2,"order_date":"2019-02-11","price":50},{"order_id":12,"customer_id":3,"order_date":"2020-03-12","price":50},{"order_id":13,"customer_id":1,"order_date":"2021-04-13","price":50},{"order_id":14,"customer_id":2,"order_date":"2022-05-14","price":50}]}' }, { label: 'Long run: 14 orders', input: '{"orders":[{"order_id":1,"customer_id":1,"order_date":"2019-02-28","price":36},{"order_id":2,"customer_id":2,"order_date":"2021-11-26","price":32},{"order_id":3,"customer_id":2,"order_date":"2019-04-16","price":37},{"order_id":4,"customer_id":4,"order_date":"2019-03-25","price":14},{"order_id":5,"customer_id":4,"order_date":"2020-03-28","price":33},{"order_id":6,"customer_id":1,"order_date":"2022-05-17","price":7},{"order_id":7,"customer_id":4,"order_date":"2019-08-19","price":1},{"order_id":8,"customer_id":2,"order_date":"2021-06-24","price":7},{"order_id":9,"customer_id":3,"order_date":"2020-10-27","price":48},{"order_id":10,"customer_id":1,"order_date":"2023-06-04","price":10},{"order_id":11,"customer_id":4,"order_date":"2023-09-12","price":19},{"order_id":12,"customer_id":4,"order_date":"2022-06-13","price":33},{"order_id":13,"customer_id":2,"order_date":"2021-05-09","price":19},{"order_id":14,"customer_id":3,"order_date":"2021-08-01","price":30}]}' }],
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
