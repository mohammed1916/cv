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
  { label: "One user, one purchase", input: "{\"Users\":[{\"user_id\":1,\"membership\":\"VIP\"}],\"Purchases\":[{\"user_id\":1,\"purchase_date\":\"2023-11-05\",\"amount_spend\":250}]}" },
  { label: "Equal amounts on one day", input: "{\"Users\":[{\"user_id\":1,\"membership\":\"Premium\"},{\"user_id\":2,\"membership\":\"Standard\"}],\"Purchases\":[{\"user_id\":1,\"purchase_date\":\"2023-11-05\",\"amount_spend\":500},{\"user_id\":2,\"purchase_date\":\"2023-11-05\",\"amount_spend\":500}]}" },
  { label: "Longest allowed: 10 users, 12 purchases", input: "{\"Users\":[{\"user_id\":1,\"membership\":\"Standard\"},{\"user_id\":2,\"membership\":\"Premium\"},{\"user_id\":3,\"membership\":\"VIP\"},{\"user_id\":4,\"membership\":\"Standard\"},{\"user_id\":5,\"membership\":\"Premium\"},{\"user_id\":6,\"membership\":\"VIP\"},{\"user_id\":7,\"membership\":\"Standard\"},{\"user_id\":8,\"membership\":\"Premium\"},{\"user_id\":9,\"membership\":\"VIP\"},{\"user_id\":10,\"membership\":\"Standard\"}],\"Purchases\":[{\"user_id\":1,\"purchase_date\":\"2023-11-01\",\"amount_spend\":9999},{\"user_id\":2,\"purchase_date\":\"2023-11-02\",\"amount_spend\":9999},{\"user_id\":3,\"purchase_date\":\"2023-11-03\",\"amount_spend\":9999},{\"user_id\":4,\"purchase_date\":\"2023-11-04\",\"amount_spend\":9999},{\"user_id\":5,\"purchase_date\":\"2023-11-05\",\"amount_spend\":9999},{\"user_id\":6,\"purchase_date\":\"2023-11-06\",\"amount_spend\":9999},{\"user_id\":7,\"purchase_date\":\"2023-11-07\",\"amount_spend\":9999},{\"user_id\":8,\"purchase_date\":\"2023-11-08\",\"amount_spend\":9999},{\"user_id\":9,\"purchase_date\":\"2023-11-09\",\"amount_spend\":9999},{\"user_id\":10,\"purchase_date\":\"2023-11-10\",\"amount_spend\":9999},{\"user_id\":1,\"purchase_date\":\"2023-11-11\",\"amount_spend\":9999},{\"user_id\":2,\"purchase_date\":\"2023-11-12\",\"amount_spend\":9999}]}" },
  { label: "Long run: 10 users, 12 purchases", input: "{\"Users\":[{\"user_id\":1,\"membership\":\"Standard\"},{\"user_id\":2,\"membership\":\"Premium\"},{\"user_id\":3,\"membership\":\"VIP\"},{\"user_id\":4,\"membership\":\"Standard\"},{\"user_id\":5,\"membership\":\"Premium\"},{\"user_id\":6,\"membership\":\"VIP\"},{\"user_id\":7,\"membership\":\"Standard\"},{\"user_id\":8,\"membership\":\"Premium\"},{\"user_id\":9,\"membership\":\"VIP\"},{\"user_id\":10,\"membership\":\"Standard\"}],\"Purchases\":[{\"user_id\":8,\"purchase_date\":\"2023-11-21\",\"amount_spend\":8003},{\"user_id\":7,\"purchase_date\":\"2023-11-06\",\"amount_spend\":9024},{\"user_id\":2,\"purchase_date\":\"2023-11-07\",\"amount_spend\":585},{\"user_id\":9,\"purchase_date\":\"2023-11-04\",\"amount_spend\":1278},{\"user_id\":4,\"purchase_date\":\"2023-11-25\",\"amount_spend\":2687},{\"user_id\":7,\"purchase_date\":\"2023-11-06\",\"amount_spend\":180},{\"user_id\":4,\"purchase_date\":\"2023-11-27\",\"amount_spend\":6021},{\"user_id\":7,\"purchase_date\":\"2023-11-12\",\"amount_spend\":6578},{\"user_id\":4,\"purchase_date\":\"2023-11-09\",\"amount_spend\":6051},{\"user_id\":5,\"purchase_date\":\"2023-11-02\",\"amount_spend\":336},{\"user_id\":6,\"purchase_date\":\"2023-11-15\",\"amount_spend\":3161},{\"user_id\":7,\"purchase_date\":\"2023-11-04\",\"amount_spend\":8822}]}" },
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
