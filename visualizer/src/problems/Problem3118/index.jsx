import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Users (user_id, membership) and Purchases (user_id, purchase_date as YYYY-MM-DD, amount_spend)'
const complexity = 'O(u + p) over the users and purchases, plus one pass per membership group. The visualization caps each table at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Users":[{"user_id":1,"membership":"basic"},{"user_id":2,"membership":"plus"},{"user_id":3,"membership":"pro"},{"user_id":4,"membership":"basic"}],"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":20},{"user_id":1,"purchase_date":"2023-11-04","amount_spend":50},{"user_id":2,"purchase_date":"2023-11-10","amount_spend":15},{"user_id":2,"purchase_date":"2023-11-17","amount_spend":35},{"user_id":4,"purchase_date":"2023-11-24","amount_spend":5},{"user_id":3,"purchase_date":"2023-10-27","amount_spend":99},{"user_id":3,"purchase_date":"2023-12-01","amount_spend":99},{"user_id":2,"purchase_date":"2023-11-12","amount_spend":40}]}',
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
    <p>Every membership group must appear in the output, so the query starts from the users and attaches only the purchases that pass the Friday and November checks.</p>
    <p>A group with no surviving purchase still gets a row, and COALESCE turns its empty sum into zero.</p>
  </>} />
}
