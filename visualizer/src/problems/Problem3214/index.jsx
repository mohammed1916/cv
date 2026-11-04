import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { user_transactions: [
  { transaction_id: 1, product_id: 1, spend: 100, transaction_date: "2022-05-01" },
  { transaction_id: 2, product_id: 1, spend: 50, transaction_date: "2022-08-10" },
  { transaction_id: 3, product_id: 1, spend: 180, transaction_date: "2023-02-02" },
  { transaction_id: 4, product_id: 2, spend: 40, transaction_date: "2022-01-15" },
  { transaction_id: 5, product_id: 2, spend: 30, transaction_date: "2023-03-03" },
  { transaction_id: 6, product_id: 2, spend: 10, transaction_date: "2023-04-04" },
  { transaction_id: 7, product_id: 3, spend: 75, transaction_date: "2023-06-06" },
  { transaction_id: 8, product_id: 3, spend: 60, transaction_date: "2024-01-01" },
  { transaction_id: 9, product_id: 4, spend: 10, transaction_date: "2021-12-31" },
  { transaction_id: 10, product_id: 4, spend: 5, transaction_date: "2023-01-01" },
] }
const inputLabel = 'JSON object with a user_transactions table (transaction_id, product_id, spend, transaction_date as YYYY-MM-DD)'
const complexity = 'Grouping and pairing the rows is linear in the transactions plus the product-years: about O(n) with hashing.'
const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

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

export default function YearOnYearGrowth() {
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
