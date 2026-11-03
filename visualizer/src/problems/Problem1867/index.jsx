import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with an OrdersDetails table (order_id, product_id, quantity)'
const complexity = 'O(n log n) over the item rows because the visual sorts orders. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({ OrdersDetails: [{ order_id: 1, product_id: 101, quantity: 5 }, { order_id: 1, product_id: 102, quantity: 7 }, { order_id: 2, product_id: 101, quantity: 3 }, { order_id: 2, product_id: 103, quantity: 3 }, { order_id: 3, product_id: 104, quantity: 4 }, { order_id: 3, product_id: 105, quantity: 10 }] }) },
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
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each order is first summarised by its average and maximum item quantity. The threshold is the largest average across all orders, and an order qualifies when its maximum is strictly above that threshold.</p>} />
}
