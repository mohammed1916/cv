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
    { label: 'Single order', input: '{"Customers":[{"customer_id":1,"name":"Ann"}],"Orders":[{"order_id":1,"order_date":"2020-08-01","customer_id":1,"cost":5}]}' },
    { label: 'Equal totals', input: '{"Customers":[{"customer_id":1,"name":"Ann"},{"customer_id":2,"name":"Ben"}],"Orders":[{"order_id":1,"order_date":"2020-07-01","customer_id":1,"cost":10},{"order_id":2,"order_date":"2020-07-01","customer_id":2,"cost":10}]}' },
    { label: 'Customer without orders', input: '{"Customers":[{"customer_id":1,"name":"Ann"},{"customer_id":2,"name":"Ben"}],"Orders":[{"order_id":1,"order_date":"2020-07-02","customer_id":1,"cost":15}]}' },
    { label: 'Long run: 12 customers, 30 orders', input: '{"Customers":[{"customer_id":1,"name":"Ann"},{"customer_id":2,"name":"Ben"},{"customer_id":3,"name":"Cy"},{"customer_id":4,"name":"Dee"},{"customer_id":5,"name":"Eli"},{"customer_id":6,"name":"Fay"},{"customer_id":7,"name":"Gus"},{"customer_id":8,"name":"Hal"},{"customer_id":9,"name":"Ivy"},{"customer_id":10,"name":"Jo"},{"customer_id":11,"name":"Kit"},{"customer_id":12,"name":"Lu"}],"Orders":[{"order_id":1,"order_date":"2020-07-09","customer_id":3,"cost":36},{"order_id":2,"order_date":"2020-07-18","customer_id":3,"cost":55},{"order_id":3,"order_date":"2020-07-25","customer_id":2,"cost":83},{"order_id":4,"order_date":"2020-07-20","customer_id":10,"cost":27},{"order_id":5,"order_date":"2020-07-24","customer_id":9,"cost":77},{"order_id":6,"order_date":"2020-07-12","customer_id":12,"cost":29},{"order_id":7,"order_date":"2020-07-09","customer_id":9,"cost":32},{"order_id":8,"order_date":"2020-07-13","customer_id":7,"cost":89},{"order_id":9,"order_date":"2020-07-14","customer_id":6,"cost":13},{"order_id":10,"order_date":"2020-07-15","customer_id":10,"cost":59},{"order_id":11,"order_date":"2020-07-07","customer_id":12,"cost":59},{"order_id":12,"order_date":"2020-07-05","customer_id":10,"cost":32},{"order_id":13,"order_date":"2020-07-16","customer_id":2,"cost":70},{"order_id":14,"order_date":"2020-07-28","customer_id":6,"cost":7},{"order_id":15,"order_date":"2020-07-15","customer_id":3,"cost":55},{"order_id":16,"order_date":"2020-07-21","customer_id":2,"cost":62},{"order_id":17,"order_date":"2020-07-11","customer_id":4,"cost":33},{"order_id":18,"order_date":"2020-07-06","customer_id":9,"cost":24},{"order_id":19,"order_date":"2020-07-25","customer_id":6,"cost":27},{"order_id":20,"order_date":"2020-07-28","customer_id":1,"cost":11},{"order_id":21,"order_date":"2020-07-21","customer_id":12,"cost":63},{"order_id":22,"order_date":"2020-07-05","customer_id":7,"cost":25},{"order_id":23,"order_date":"2020-07-06","customer_id":4,"cost":39},{"order_id":24,"order_date":"2020-07-02","customer_id":1,"cost":57},{"order_id":25,"order_date":"2020-07-20","customer_id":5,"cost":24},{"order_id":26,"order_date":"2020-07-03","customer_id":4,"cost":12},{"order_id":27,"order_date":"2020-07-01","customer_id":6,"cost":73},{"order_id":28,"order_date":"2020-07-02","customer_id":6,"cost":14},{"order_id":29,"order_date":"2020-07-02","customer_id":3,"cost":87},{"order_id":30,"order_date":"2020-07-21","customer_id":8,"cost":13}]}' },
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
