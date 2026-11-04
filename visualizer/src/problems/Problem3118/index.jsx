import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Users (user_id, membership) and Purchases (user_id, purchase_date as YYYY-MM-DD, amount_spend)'
const complexity = 'O(u + p) over the users and purchases, plus a fixed grid of 4 weeks by 2 memberships. The visualization caps each table at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Users":[{"user_id":1,"membership":"Premium"},{"user_id":2,"membership":"VIP"},{"user_id":3,"membership":"Standard"}],"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":1126},{"user_id":2,"purchase_date":"2023-11-10","amount_spend":7473},{"user_id":3,"purchase_date":"2023-11-03","amount_spend":999},{"user_id":2,"purchase_date":"2023-11-24","amount_spend":14933},{"user_id":1,"purchase_date":"2023-11-24","amount_spend":5117}]}',
  },
]

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

export default function FridayPurchaseSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every week and membership pair must appear in the output, so the query builds the full grid of weeks and memberships first and then attaches only the Premium and VIP Friday purchases from November.</p>
    <p>A pair with no surviving purchase still gets a row, and COALESCE turns its empty sum into zero.</p>
  </>} />
}
