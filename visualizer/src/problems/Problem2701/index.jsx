import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Transactions table (transaction_id, customer_id, transaction_date, amount)'
const complexity = 'O(n log n) for the sort plus one pass over the rows. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2025-05-01","amount":100},{"transaction_id":2,"customer_id":1,"transaction_date":"2025-05-02","amount":150},{"transaction_id":3,"customer_id":1,"transaction_date":"2025-05-03","amount":170},{"transaction_id":4,"customer_id":1,"transaction_date":"2025-05-04","amount":160},{"transaction_id":5,"customer_id":2,"transaction_date":"2025-05-01","amount":50},{"transaction_id":6,"customer_id":2,"transaction_date":"2025-05-02","amount":60},{"transaction_id":7,"customer_id":2,"transaction_date":"2025-05-04","amount":70},{"transaction_id":8,"customer_id":2,"transaction_date":"2025-05-05","amount":80},{"transaction_id":9,"customer_id":3,"transaction_date":"2025-05-10","amount":5},{"transaction_id":10,"customer_id":3,"transaction_date":"2025-05-11","amount":6},{"transaction_id":11,"customer_id":3,"transaction_date":"2025-05-12","amount":7},{"transaction_id":12,"customer_id":3,"transaction_date":"2025-05-13","amount":8},{"transaction_id":13,"customer_id":4,"transaction_date":"2025-05-02","amount":10},{"transaction_id":14,"customer_id":4,"transaction_date":"2025-05-03","amount":9},{"transaction_id":15,"customer_id":4,"transaction_date":"2025-05-04","amount":11},{"transaction_id":16,"customer_id":4,"transaction_date":"2025-05-05","amount":12}]}',
}]
const reasoning = 'Within each customer, a day joins the current run only when it follows the previous transaction on the very next calendar day and its amount is strictly larger. Runs are the groups of joined days; only runs with at least three dates are returned.'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function ConsecutiveIncreasingTransactions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
