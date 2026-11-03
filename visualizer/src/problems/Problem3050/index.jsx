import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Toppings table'
const complexity = 'O(t^3) for t toppings, since every trio is built once. The visualizer caps Toppings at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Toppings":[{"topping_name":"Dates","cost":4},{"topping_name":"Anchovy","cost":2},{"topping_name":"Eggplant","cost":2.5},{"topping_name":"Corn","cost":3},{"topping_name":"Basil","cost":1}]}',
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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Ordering the topping names lets each set of three appear exactly once. The costs are added for each trio, and the finished pizzas are sorted by total cost, then by name.</p>} />
}
