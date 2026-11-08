import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Toppings table'
const complexity = 'O(t^3) for t toppings, since every trio is built once. The visualizer caps Toppings at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Toppings":[{"topping_name":"Dates","cost":4},{"topping_name":"Anchovy","cost":2},{"topping_name":"Eggplant","cost":2.5},{"topping_name":"Corn","cost":3},{"topping_name":"Basil","cost":1}]}',
},
  { label: 'Single topping', input: '{"Toppings":[{"topping_name":"Salt","cost":1}]}' },
  { label: 'Equal costs', input: '{"Toppings":[{"topping_name":"Oat","cost":2},{"topping_name":"Pea","cost":2},{"topping_name":"Rye","cost":2}]}' },
  { label: 'Twelve toppings', input: '{"Toppings":[{"topping_name":"T01","cost":5},{"topping_name":"T02","cost":8},{"topping_name":"T03","cost":1},{"topping_name":"T04","cost":6},{"topping_name":"T05","cost":9},{"topping_name":"T06","cost":6},{"topping_name":"T07","cost":3},{"topping_name":"T08","cost":5},{"topping_name":"T09","cost":8},{"topping_name":"T10","cost":3},{"topping_name":"T11","cost":3},{"topping_name":"T12","cost":5}]}' },
  { label: 'Long run: 12 decimal costs', input: '{"Toppings":[{"topping_name":"Item1","cost":3.5},{"topping_name":"Item2","cost":6},{"topping_name":"Item3","cost":4.5},{"topping_name":"Item4","cost":3},{"topping_name":"Item5","cost":9.5},{"topping_name":"Item6","cost":2},{"topping_name":"Item7","cost":4.5},{"topping_name":"Item8","cost":3},{"topping_name":"Item9","cost":5.5},{"topping_name":"Item10","cost":4},{"topping_name":"Item11","cost":0.5},{"topping_name":"Item12","cost":5}]}' },
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

export default function SqlStageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Ordering the topping names lets each set of three appear exactly once. The costs are added for each trio, and the finished pizzas are sorted by total cost, then by name.</p>} />
}
