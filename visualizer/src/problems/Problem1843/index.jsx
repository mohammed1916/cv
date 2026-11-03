import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Accounts":[{"account_id":1,"max_income":700},{"account_id":2,"max_income":500},{"account_id":3,"max_income":300},{"account_id":4,"max_income":300},{"account_id":5,"max_income":100}],"Transactions":[{"transaction_id":1,"account_id":1,"type":"Creditor","amount":800,"day":"2020-01-05"},{"transaction_id":2,"account_id":1,"type":"Creditor","amount":800,"day":"2020-02-10"},{"transaction_id":3,"account_id":1,"type":"Debtor","amount":100,"day":"2020-03-01"},{"transaction_id":4,"account_id":2,"type":"Creditor","amount":600,"day":"2020-01-20"},{"transaction_id":5,"account_id":2,"type":"Debtor","amount":600,"day":"2020-02-21"},{"transaction_id":6,"account_id":2,"type":"Creditor","amount":600,"day":"2020-03-03"},{"transaction_id":7,"account_id":3,"type":"Creditor","amount":200,"day":"2020-01-02"},{"transaction_id":8,"account_id":3,"type":"Creditor","amount":150,"day":"2020-01-09"},{"transaction_id":9,"account_id":3,"type":"Creditor","amount":100,"day":"2020-02-14"},{"transaction_id":10,"account_id":4,"type":"Creditor","amount":300,"day":"2020-01-01"},{"transaction_id":11,"account_id":4,"type":"Creditor","amount":301,"day":"2020-02-01"},{"transaction_id":12,"account_id":5,"type":"Creditor","amount":150,"day":"2020-01-30"},{"transaction_id":13,"account_id":5,"type":"Creditor","amount":200,"day":"2020-02-02"}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Accounts and Transactions tables (day as YYYY-MM-DD)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(T log T) for T transactions, from grouping by account and month and a sort of the flagged months. The visualizer caps each table at 20 rows.',
  examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function SuspiciousBankAccountsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only incoming credits count, and a month is over the line only when its total is strictly greater than max_income.</p>
    <p>Two over-limit months must be adjacent in the calendar. Account 2 is over in January and March, which is not enough.</p>
  </>} />
}
