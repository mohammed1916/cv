import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with an OrdersDetails table (order_id, product_id, quantity)'
const complexity = 'O(n log n) over the item rows because the visual sorts orders. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({ OrdersDetails: [{ order_id: 1, product_id: 101, quantity: 5 }, { order_id: 1, product_id: 102, quantity: 7 }, { order_id: 2, product_id: 101, quantity: 3 }, { order_id: 2, product_id: 103, quantity: 3 }, { order_id: 3, product_id: 104, quantity: 4 }, { order_id: 3, product_id: 105, quantity: 10 }] }) },
  { label: 'Single row', input: "{\"OrdersDetails\":[{\"order_id\":1,\"product_id\":1,\"quantity\":1}]}" },
  { label: 'Equal quantities', input: "{\"OrdersDetails\":[{\"order_id\":2,\"product_id\":5,\"quantity\":3},{\"order_id\":2,\"product_id\":9,\"quantity\":3}]}" },
  { label: 'Largest ids and quantity', input: "{\"OrdersDetails\":[{\"order_id\":20,\"product_id\":200,\"quantity\":100}]}" },
  { label: 'Long run: 12 rows', input: "{\"OrdersDetails\":[{\"order_id\":14,\"product_id\":155,\"quantity\":28},{\"order_id\":6,\"product_id\":12,\"quantity\":38},{\"order_id\":1,\"product_id\":5,\"quantity\":22},{\"order_id\":5,\"product_id\":66,\"quantity\":75},{\"order_id\":18,\"product_id\":20,\"quantity\":64},{\"order_id\":18,\"product_id\":17,\"quantity\":82},{\"order_id\":3,\"product_id\":191,\"quantity\":43},{\"order_id\":16,\"product_id\":59,\"quantity\":45},{\"order_id\":15,\"product_id\":194,\"quantity\":75},{\"order_id\":6,\"product_id\":6,\"quantity\":28},{\"order_id\":16,\"product_id\":136,\"quantity\":96},{\"order_id\":2,\"product_id\":142,\"quantity\":24}]}" },
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

export default function OrdersAboveAverageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each order is first summarised by its average and maximum item quantity. The threshold is the largest average across all orders, and an order qualifies when its maximum is strictly above that threshold.</p>} />
}
