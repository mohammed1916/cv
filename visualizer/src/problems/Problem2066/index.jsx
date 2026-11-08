import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Invented sample tables'
const complexity = 'Each table is capped at 12 rows in this visualizer. The trace does one pass per table plus the final output.'
const examples = [{ label: 'Sample', input: '{"Transactions":[{"account_id":1,"day":5,"type":"Deposit","amount":50},{"account_id":2,"day":3,"type":"Deposit","amount":200},{"account_id":1,"day":1,"type":"Deposit","amount":100},{"account_id":2,"day":4,"type":"Withdraw","amount":80},{"account_id":1,"day":2,"type":"Withdraw","amount":30}]}' }, { label: "Single deposit", input: "{\"Transactions\":[{\"account_id\":1,\"day\":1,\"type\":\"Deposit\",\"amount\":0}]}" }, { label: "Same day other account", input: "{\"Transactions\":[{\"account_id\":1,\"day\":2,\"type\":\"Deposit\",\"amount\":10},{\"account_id\":2,\"day\":2,\"type\":\"Withdraw\",\"amount\":10}]}" }, { label: "Large amounts", input: "{\"Transactions\":[{\"account_id\":9,\"day\":1,\"type\":\"Deposit\",\"amount\":1000000},{\"account_id\":9,\"day\":2,\"type\":\"Withdraw\",\"amount\":999999}]}" }, { label: "Long run: 16 transactions", input: "{\"Transactions\":[{\"account_id\":1,\"day\":1,\"type\":\"Deposit\",\"amount\":95},{\"account_id\":2,\"day\":2,\"type\":\"Deposit\",\"amount\":114},{\"account_id\":3,\"day\":1,\"type\":\"Deposit\",\"amount\":260},{\"account_id\":4,\"day\":2,\"type\":\"Deposit\",\"amount\":89},{\"account_id\":1,\"day\":3,\"type\":\"Deposit\",\"amount\":318},{\"account_id\":2,\"day\":4,\"type\":\"Withdraw\",\"amount\":76},{\"account_id\":3,\"day\":3,\"type\":\"Deposit\",\"amount\":108},{\"account_id\":4,\"day\":4,\"type\":\"Deposit\",\"amount\":148},{\"account_id\":1,\"day\":5,\"type\":\"Deposit\",\"amount\":75},{\"account_id\":2,\"day\":6,\"type\":\"Withdraw\",\"amount\":1},{\"account_id\":3,\"day\":5,\"type\":\"Withdraw\",\"amount\":345},{\"account_id\":4,\"day\":6,\"type\":\"Deposit\",\"amount\":487},{\"account_id\":1,\"day\":7,\"type\":\"Deposit\",\"amount\":131},{\"account_id\":2,\"day\":8,\"type\":\"Withdraw\",\"amount\":193},{\"account_id\":3,\"day\":7,\"type\":\"Deposit\",\"amount\":302},{\"account_id\":4,\"day\":8,\"type\":\"Withdraw\",\"amount\":470}]}" }]

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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each step shows the rows the query holds at that moment, from the first table read through the final output. The sample tables are invented for this walkthrough.</p>} />
}
