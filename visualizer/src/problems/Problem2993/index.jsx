import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Purchases table (user_id, purchase_date as YYYY-MM-DD, amount_spend)'
const complexity = 'One filter pass plus one grouping pass: O(n) time with one entry per Friday. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":40},{"user_id":2,"purchase_date":"2023-11-03","amount_spend":25},{"user_id":1,"purchase_date":"2023-11-10","amount_spend":15},{"user_id":3,"purchase_date":"2023-11-08","amount_spend":99},{"user_id":4,"purchase_date":"2023-11-17","amount_spend":60},{"user_id":2,"purchase_date":"2023-11-17","amount_spend":5},{"user_id":5,"purchase_date":"2023-12-01","amount_spend":70},{"user_id":3,"purchase_date":"2023-11-24","amount_spend":30}]}',
}]

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

export default function FridayPurchasesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Filter to November 2023 first, then keep only Fridays. A December 1 purchase is a Friday but falls outside the month, so it is skipped.</p>
    <p>Week of month is the day number divided by seven, rounded up: days 1 to 7 are week 1, days 8 to 14 are week 2, and so on.</p>
  </>} />
}
