import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Items', description: 'Read the items and their categories.' },
  { id: 'weekday', label: 'Weekday', description: 'Name the weekday of each order and attach its category.' },
  { id: 'pivot', label: 'Pivot', description: 'Total each category across the seven weekday columns.' },
  { id: 'done', label: 'Result', description: 'Return one row per category.' },
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
  number: '1479', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Items ({ item_id, item_name, item_category }) and Orders ({ order_id, order_date, item_id, quantity }) lists',
  url: 'https://leetcode.com/problems/sales-by-day-of-the-week/',
  complexity: 'O(o) to tag orders, then O(c * o) for the category-by-day totals in this visualization.',
  examples: [
    { label: 'Example', input: '{"Items":[{"item_id":1,"item_name":"Laptop","item_category":"Electronics"},{"item_id":2,"item_name":"Pen","item_category":"Stationery"},{"item_id":3,"item_name":"Desk","item_category":"Furniture"},{"item_id":4,"item_name":"Phone","item_category":"Electronics"}],"Orders":[{"order_id":1,"customer_id":1,"order_date":"2020-06-29","item_id":1,"quantity":2},{"order_id":2,"customer_id":2,"order_date":"2020-06-29","item_id":2,"quantity":5},{"order_id":3,"customer_id":1,"order_date":"2020-07-04","item_id":1,"quantity":1},{"order_id":4,"customer_id":3,"order_date":"2020-07-05","item_id":3,"quantity":3},{"order_id":5,"customer_id":2,"order_date":"2020-06-30","item_id":2,"quantity":4}]}' },
  ],
}

export default function SalesByDayOfTheWeek() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Each order gets a weekday from its date. Quantities are then summed per category and per weekday, so every category has seven columns even when a day is empty.</p>
  </>} />
}
