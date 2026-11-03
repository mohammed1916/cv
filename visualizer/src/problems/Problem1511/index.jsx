import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Customers', description: 'Read the customers in id order.' },
  { id: 'total', label: 'Totals', description: 'Add price times quantity for June and July.' },
  { id: 'decide', label: 'Decide', description: 'Check that both months reach 100.' },
  { id: 'done', label: 'Result', description: 'Return the customers who pass both months.' },
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
  number: '1511', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Customers, Product (price per unit) and Orders (quantity, order_date) lists',
  url: 'https://leetcode.com/problems/customer-order-frequency/',
  complexity: 'O(c * o) in this visualization, which rescans the orders for each customer.',
  examples: [
    { label: 'Example', input: '{"Customers":[{"customer_id":1,"name":"Winston"},{"customer_id":2,"name":"Jonathan"},{"customer_id":3,"name":"Annabelle"}],"Product":[{"product_id":1,"price":50},{"product_id":2,"price":20}],"Orders":[{"order_id":1,"customer_id":1,"product_id":1,"order_date":"2020-06-10","quantity":2},{"order_id":2,"customer_id":1,"product_id":1,"order_date":"2020-07-05","quantity":3},{"order_id":3,"customer_id":2,"product_id":1,"order_date":"2020-06-01","quantity":5},{"order_id":4,"customer_id":2,"product_id":1,"order_date":"2020-07-20","quantity":1},{"order_id":5,"customer_id":3,"product_id":1,"order_date":"2020-06-15","quantity":1},{"order_id":6,"customer_id":3,"product_id":2,"order_date":"2020-06-15","quantity":1},{"order_id":7,"customer_id":3,"product_id":1,"order_date":"2020-07-01","quantity":4},{"order_id":8,"customer_id":2,"product_id":1,"order_date":"2020-08-01","quantity":1}]}' },
  ],
}

export default function CustomerOrderFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Spending is price times quantity, summed per month. Orders outside June and July are ignored, and both months must reach 100 for the customer to qualify.</p>
  </>} />
}
