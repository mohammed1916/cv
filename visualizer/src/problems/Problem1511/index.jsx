import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Customers', description: 'Read the customers in id order.' },
  { id: 'total', label: 'Totals', description: 'Add price times quantity for June and July.' },
  { id: 'decide', label: 'Decide', description: 'Check that both months reach 100.' },
  { id: 'done', label: 'Result', description: 'Return the customers who pass both months.' },
]

const STAGE = {
  load: 'FROM Customers: one row per customer, in id order.',
  total: 'JOIN Orders and Product, WHERE 2020, GROUP BY customer: SUM(quantity × price) per month. The highlighted row is the customer being totalled.',
  decide: 'HAVING: both monthly sums must be at least 100. The bars show each month against the 100 line.',
  done: 'ORDER BY customer_id: the customers that passed both months.',
}

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }
const HIGHLIGHT = 'color-mix(in srgb, var(--primary) 28%, var(--surface2))'
const PASS = 'color-mix(in srgb, var(--success) 40%, var(--surface2))'
const MISS = 'color-mix(in srgb, var(--warning) 40%, var(--surface2))'

function TableView({ caption, columns, rows, isCurrent = () => false }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index} data-current={isCurrent(row, index) ? 'yes' : undefined}
        style={{ background: isCurrent(row, index) ? HIGHLIGHT : undefined, fontWeight: isCurrent(row, index) ? 600 : undefined }}>
        {columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}
      </tr>)}</tbody>
  </table>
}

function MonthBar({ label, value }) {
  const width = Math.min(100, (value / 100) * 100)
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0', color: 'var(--text)' }}>
    <span style={{ width: 48, fontFamily: 'monospace' }}>{label}</span>
    <div style={{ position: 'relative', flex: 1, maxWidth: 260, height: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ width: `${width}%`, height: '100%', background: value >= 100 ? PASS : MISS }} />
      <div aria-hidden="true" style={{ position: 'absolute', left: '100%', top: -4, bottom: -4, borderLeft: '2px solid var(--text)' }} />
    </div>
    <span style={{ fontFamily: 'monospace' }}>{value}</span>
  </div>
}

const definition = {
  number: '1511', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Customers, Product (price per unit) and Orders (quantity, order_date) lists',
  url: 'https://leetcode.com/problems/customer-order-frequency/',
  complexity: 'O(c * o) in this visualization, which rescans the orders for each customer.',
  examples: [
    { label: 'Example', input: '{"Customers":[{"customer_id":1,"name":"Winston"},{"customer_id":2,"name":"Jonathan"},{"customer_id":3,"name":"Annabelle"}],"Product":[{"product_id":1,"price":50},{"product_id":2,"price":20}],"Orders":[{"order_id":1,"customer_id":1,"product_id":1,"order_date":"2020-06-10","quantity":2},{"order_id":2,"customer_id":1,"product_id":1,"order_date":"2020-07-05","quantity":3},{"order_id":3,"customer_id":2,"product_id":1,"order_date":"2020-06-01","quantity":5},{"order_id":4,"customer_id":2,"product_id":1,"order_date":"2020-07-20","quantity":1},{"order_id":5,"customer_id":3,"product_id":1,"order_date":"2020-06-15","quantity":1},{"order_id":6,"customer_id":3,"product_id":2,"order_date":"2020-06-15","quantity":1},{"order_id":7,"customer_id":3,"product_id":1,"order_date":"2020-07-01","quantity":4},{"order_id":8,"customer_id":2,"product_id":1,"order_date":"2020-08-01","quantity":1}]}' },
    { label: 'Single order', input: '{"Customers":[{"customer_id":1,"name":"Ada"}],"Product":[{"product_id":1,"price":10}],"Orders":[{"order_id":1,"customer_id":1,"product_id":1,"order_date":"2020-08-01","quantity":1}]}' },
    { label: 'Zero quantity', input: '{"Customers":[{"customer_id":1,"name":"Ada"}],"Product":[{"product_id":1,"price":5}],"Orders":[{"order_id":1,"customer_id":1,"product_id":1,"order_date":"2020-08-01","quantity":0}]}' },
    { label: 'Equal totals', input: '{"Customers":[{"customer_id":1,"name":"Ada"},{"customer_id":2,"name":"Ben"}],"Product":[{"product_id":1,"price":10}],"Orders":[{"order_id":1,"customer_id":1,"product_id":1,"order_date":"2020-09-01","quantity":2},{"order_id":2,"customer_id":2,"product_id":1,"order_date":"2020-09-01","quantity":2}]}' },
    { label: 'Long run: 12 customers, 30 orders', input: '{"Customers":[{"customer_id":1,"name":"Customer 1"},{"customer_id":2,"name":"Customer 2"},{"customer_id":3,"name":"Customer 3"},{"customer_id":4,"name":"Customer 4"},{"customer_id":5,"name":"Customer 5"},{"customer_id":6,"name":"Customer 6"},{"customer_id":7,"name":"Customer 7"},{"customer_id":8,"name":"Customer 8"},{"customer_id":9,"name":"Customer 9"},{"customer_id":10,"name":"Customer 10"},{"customer_id":11,"name":"Customer 11"},{"customer_id":12,"name":"Customer 12"}],"Product":[{"product_id":1,"price":3},{"product_id":2,"price":48},{"product_id":3,"price":65},{"product_id":4,"price":22},{"product_id":5,"price":58},{"product_id":6,"price":62},{"product_id":7,"price":12},{"product_id":8,"price":39},{"product_id":9,"price":25},{"product_id":10,"price":45},{"product_id":11,"price":30},{"product_id":12,"price":75}],"Orders":[{"order_id":1,"customer_id":9,"product_id":4,"order_date":"2020-04-13","quantity":3},{"order_id":2,"customer_id":7,"product_id":4,"order_date":"2020-05-27","quantity":4},{"order_id":3,"customer_id":2,"product_id":9,"order_date":"2020-02-26","quantity":5},{"order_id":4,"customer_id":6,"product_id":3,"order_date":"2020-03-22","quantity":3},{"order_id":5,"customer_id":1,"product_id":1,"order_date":"2020-05-16","quantity":1},{"order_id":6,"customer_id":5,"product_id":2,"order_date":"2020-05-27","quantity":0},{"order_id":7,"customer_id":12,"product_id":9,"order_date":"2020-09-24","quantity":1},{"order_id":8,"customer_id":11,"product_id":11,"order_date":"2020-02-26","quantity":0},{"order_id":9,"customer_id":10,"product_id":1,"order_date":"2020-01-22","quantity":0},{"order_id":10,"customer_id":7,"product_id":4,"order_date":"2020-04-27","quantity":4},{"order_id":11,"customer_id":6,"product_id":12,"order_date":"2020-07-13","quantity":3},{"order_id":12,"customer_id":9,"product_id":7,"order_date":"2020-04-25","quantity":1},{"order_id":13,"customer_id":11,"product_id":8,"order_date":"2020-02-24","quantity":1},{"order_id":14,"customer_id":12,"product_id":5,"order_date":"2020-09-16","quantity":0},{"order_id":15,"customer_id":8,"product_id":7,"order_date":"2020-02-17","quantity":4},{"order_id":16,"customer_id":1,"product_id":1,"order_date":"2020-03-13","quantity":0},{"order_id":17,"customer_id":11,"product_id":7,"order_date":"2020-01-23","quantity":5},{"order_id":18,"customer_id":12,"product_id":4,"order_date":"2020-08-10","quantity":3},{"order_id":19,"customer_id":4,"product_id":9,"order_date":"2020-09-17","quantity":0},{"order_id":20,"customer_id":9,"product_id":2,"order_date":"2020-04-28","quantity":1},{"order_id":21,"customer_id":7,"product_id":7,"order_date":"2020-08-19","quantity":0},{"order_id":22,"customer_id":9,"product_id":9,"order_date":"2020-04-19","quantity":2},{"order_id":23,"customer_id":10,"product_id":7,"order_date":"2020-04-18","quantity":2},{"order_id":24,"customer_id":12,"product_id":7,"order_date":"2020-01-24","quantity":4},{"order_id":25,"customer_id":3,"product_id":12,"order_date":"2020-04-22","quantity":0},{"order_id":26,"customer_id":11,"product_id":1,"order_date":"2020-03-17","quantity":1},{"order_id":27,"customer_id":1,"product_id":9,"order_date":"2020-03-22","quantity":4},{"order_id":28,"customer_id":1,"product_id":1,"order_date":"2020-08-13","quantity":2},{"order_id":29,"customer_id":12,"product_id":9,"order_date":"2020-02-15","quantity":4},{"order_id":30,"customer_id":10,"product_id":6,"order_date":"2020-06-14","quantity":5}]}' },
  ],
}

export default function CustomerOrderFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const rows = step.rows
    const focusIndex = (step.phase === 'total' || step.phase === 'decide') ? rows.length - 1 : -1
    const current = focusIndex >= 0 ? rows[focusIndex] : null
    return <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <section aria-label="SQL stage">
        <h3>Stage: {phases.find(p => p.id === step.phase)?.label}</h3>
        <p>{STAGE[step.phase]}</p>
      </section>
      <p>{step.message}</p>
      <TableView caption="Current rows" columns={step.columns} rows={rows} isCurrent={(row, index) => index === focusIndex} />
      {current && <section aria-label="Monthly spend against 100">
        <h3>{current.name}: spend against the 100 threshold</h3>
        {'june' in current && <MonthBar label="June" value={current.june} />}
        {'july' in current && <MonthBar label="July" value={current.july} />}
      </section>}
    </>
  }} renderReasoning={() => <>
    <p>Spending is price times quantity, summed per month. Orders outside June and July are ignored, and both months must reach 100 for the customer to qualify.</p>
    <p>Every stage is a table: customers, then monthly totals, then the filter on both months, then the sorted result.</p>
  </>} />
}
