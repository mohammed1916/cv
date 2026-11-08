import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { Products: [
  { product_id: 10, category: "books", price: 15 },
  { product_id: 20, category: "games", price: 40 },
  { product_id: 30, category: "music", price: 9 },
], Transactions: [
  { transaction_id: 1, customer_id: 1, product_id: 10, amount: 15 },
  { transaction_id: 2, customer_id: 1, product_id: 10, amount: 15 },
  { transaction_id: 3, customer_id: 1, product_id: 20, amount: 40 },
  { transaction_id: 4, customer_id: 2, product_id: 30, amount: 9 },
  { transaction_id: 5, customer_id: 2, product_id: 20, amount: 40 },
  { transaction_id: 6, customer_id: 2, product_id: 20, amount: 40 },
  { transaction_id: 7, customer_id: 3, product_id: 30, amount: 9 },
  { transaction_id: 8, customer_id: 4, product_id: 10, amount: 15 },
  { transaction_id: 9, customer_id: 4, product_id: 30, amount: 9 },
] }
const inputLabel = 'JSON object with Transactions and Products tables'
const complexity = 'Joining and counting is linear in the purchases; the per-customer ranking adds a sort: O(n log n).'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'One product sale', input: '{"Transactions":[{"transaction_id":1,"customer_id":9,"product_id":501,"amount":0}],"Products":[{"product_id":501,"category":"Books","price":12}]}' },
  { label: 'Equal amounts in one category', input: '{"Transactions":[{"transaction_id":1,"customer_id":9,"product_id":501,"amount":10},{"transaction_id":2,"customer_id":8,"product_id":502,"amount":10}],"Products":[{"product_id":501,"category":"Games","price":10},{"product_id":502,"category":"Games","price":10}]}' },
  { label: 'Long run: 12 transactions', input: '{"Transactions":[{"transaction_id":1,"customer_id":1,"product_id":501,"amount":285},{"transaction_id":2,"customer_id":2,"product_id":502,"amount":268},{"transaction_id":3,"customer_id":3,"product_id":503,"amount":199},{"transaction_id":4,"customer_id":4,"product_id":501,"amount":89},{"transaction_id":5,"customer_id":1,"product_id":502,"amount":163},{"transaction_id":6,"customer_id":2,"product_id":503,"amount":118},{"transaction_id":7,"customer_id":3,"product_id":501,"amount":278},{"transaction_id":8,"customer_id":4,"product_id":502,"amount":175},{"transaction_id":9,"customer_id":1,"product_id":503,"amount":194},{"transaction_id":10,"customer_id":2,"product_id":501,"amount":67},{"transaction_id":11,"customer_id":3,"product_id":502,"amount":152},{"transaction_id":12,"customer_id":4,"product_id":503,"amount":137}],"Products":[{"product_id":501,"category":"Books","price":12},{"product_id":502,"category":"Games","price":30},{"product_id":503,"category":"Books","price":8}]}' },
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

export default function CustomerPurchasingBehavior() {
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
