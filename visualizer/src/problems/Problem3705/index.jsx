import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { phases, sql, code, python, parseInput, buildTrace } from './algorithm'

const inputLabel = 'Object with an orders list of [order_id, customer_id, hour_of_day] rows'
const complexity = 'O(n) time for n order rows, plus a sort of the distinct customers in the result. The visualization caps rows at 12.'
const examples = [
  { label: 'Sample', input: '{"orders":[[1,7,18],[2,3,19],[3,7,9],[4,7,19],[5,3,20],[6,7,18],[7,5,18],[8,3,18]]}' },
  { label: 'Boundary', input: '{"orders":[[1,4,19],[2,4,18],[3,4,20],[4,4,17],[5,9,18],[6,9,19],[7,9,18]]}' },
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples }

export default function GoldenHourCustomers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Orders">
      <thead><tr><th>order_id</th><th>customer_id</th><th>hour_of_day</th></tr></thead>
      <tbody>{run.input.orders.map(([orderId, customerId, hour]) => {
        const current = step.row?.order_id === orderId
        return <tr key={orderId} data-current={current ? 'true' : undefined} data-in-window={current ? String(step.row.inWindow) : undefined}>
          <td>{orderId}</td><td>{customerId}</td><td>{hour}</td>
        </tr>
      })}</tbody>
    </table>
    <table aria-label="Golden-hour counts">
      <thead><tr><th>customer_id</th><th>orders in 18 to 19</th></tr></thead>
      <tbody>{Object.keys(step.counts).map(Number).sort((a, b) => a - b).map(id => <tr key={id}><td>{id}</td><td>{step.counts[id]}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each order either falls inside the window, which adds one to its customer, or it is ignored. Counts are collected first, then each customer is compared with the threshold.</p>
    <p>The same logic as a grouped query:</p>
    <pre>{sql}</pre>
  </>} />
}
