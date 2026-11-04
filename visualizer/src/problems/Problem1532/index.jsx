import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Orders', description: 'Read every order with its customer and date.' },
  { id: 'rank', label: 'Rank', description: 'Keep the three newest orders for one customer.' },
  { id: 'sort', label: 'Sort', description: 'Order the rows by name, customer, then newest first.' },
  { id: 'done', label: 'Result', description: 'Return the kept orders.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  number: '1532', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Customers ({ customer_id, name }) and Orders ({ order_id, order_date, customer_id, cost }) lists',
  url: 'https://leetcode.com/problems/the-most-recent-three-orders/',
  complexity: 'O(o log o) to sort the orders, then up to three picks per customer.',
  examples: [
    { label: 'Example', input: '{"Customers":[{"customer_id":1,"name":"Alice"},{"customer_id":2,"name":"Bob"}],"Orders":[{"order_id":1,"order_date":"2020-07-01","customer_id":1,"cost":30},{"order_id":2,"order_date":"2020-07-10","customer_id":1,"cost":45},{"order_id":3,"order_date":"2020-07-05","customer_id":1,"cost":20},{"order_id":4,"order_date":"2020-06-30","customer_id":1,"cost":15},{"order_id":5,"order_date":"2020-07-03","customer_id":2,"cost":10},{"order_id":6,"order_date":"2020-07-03","customer_id":2,"cost":25},{"order_id":7,"order_date":"2020-07-20","customer_id":2,"cost":60},{"order_id":8,"order_date":"2020-07-15","customer_id":2,"cost":35}]}' },
  ],
}

export default function MostRecentThreeOrders() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>A teaching version with invented sample tables.</p>
    <p>Each customer is ranked on its own, newest first, and only the top three rows stay. The final list is ordered by customer name, customer id, then date with the newest first.</p>
  </>} />
}
