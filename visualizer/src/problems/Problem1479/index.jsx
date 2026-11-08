import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Items', description: 'Read the items and their categories.' },
  { id: 'weekday', label: 'Weekday', description: 'Name the weekday of each order and attach its category.' },
  { id: 'pivot', label: 'Pivot', description: 'Total each category across the seven weekday columns.' },
  { id: 'done', label: 'Result', description: 'Return one row per category.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }


const definition = {
  number: '1479', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Items ({ item_id, item_name, item_category }) and Orders ({ order_id, order_date, item_id, quantity }) lists',
  url: 'https://leetcode.com/problems/sales-by-day-of-the-week/',
  complexity: 'O(o) to tag orders, then O(c * o) for the category-by-day totals in this visualization.',
  examples: [
    { label: 'Example', input: '{"Items":[{"item_id":1,"item_name":"Laptop","item_category":"Electronics"},{"item_id":2,"item_name":"Pen","item_category":"Stationery"},{"item_id":3,"item_name":"Desk","item_category":"Furniture"},{"item_id":4,"item_name":"Phone","item_category":"Electronics"}],"Orders":[{"order_id":1,"customer_id":1,"order_date":"2020-06-29","item_id":1,"quantity":2},{"order_id":2,"customer_id":2,"order_date":"2020-06-29","item_id":2,"quantity":5},{"order_id":3,"customer_id":1,"order_date":"2020-07-04","item_id":1,"quantity":1},{"order_id":4,"customer_id":3,"order_date":"2020-07-05","item_id":3,"quantity":3},{"order_id":5,"customer_id":2,"order_date":"2020-06-30","item_id":2,"quantity":4}]}' },
    { label: 'Single order', input: '{"Items":[{"item_id":7,"item_name":"Mug","item_category":"Kitchen"}],"Orders":[{"order_id":1,"customer_id":1,"order_date":"2021-01-01","item_id":7,"quantity":0}]}' },
    { label: 'Same day ties', input: '{"Items":[{"item_id":1,"item_name":"Lamp","item_category":"Home"},{"item_id":2,"item_name":"Rug","item_category":"Home"}],"Orders":[{"order_id":1,"customer_id":1,"order_date":"2021-02-14","item_id":1,"quantity":3},{"order_id":2,"customer_id":2,"order_date":"2021-02-14","item_id":2,"quantity":3}]}' },
    { label: 'Long run: 12 items, 20 orders', input: '{"Items":[{"item_id":1,"item_name":"Item 1","item_category":"Electronics"},{"item_id":2,"item_name":"Item 2","item_category":"Toys"},{"item_id":3,"item_name":"Item 3","item_category":"Books"},{"item_id":4,"item_name":"Item 4","item_category":"Garden"},{"item_id":5,"item_name":"Item 5","item_category":"Garden"},{"item_id":6,"item_name":"Item 6","item_category":"Garden"},{"item_id":7,"item_name":"Item 7","item_category":"Garden"},{"item_id":8,"item_name":"Item 8","item_category":"Garden"},{"item_id":9,"item_name":"Item 9","item_category":"Toys"},{"item_id":10,"item_name":"Item 10","item_category":"Garden"},{"item_id":11,"item_name":"Item 11","item_category":"Books"},{"item_id":12,"item_name":"Item 12","item_category":"Toys"}],"Orders":[{"order_id":1,"customer_id":1,"order_date":"2021-02-18","item_id":10,"quantity":5},{"order_id":2,"customer_id":5,"order_date":"2021-01-21","item_id":5,"quantity":1},{"order_id":3,"customer_id":3,"order_date":"2021-03-17","item_id":2,"quantity":6},{"order_id":4,"customer_id":6,"order_date":"2021-01-26","item_id":9,"quantity":2},{"order_id":5,"customer_id":2,"order_date":"2021-02-25","item_id":2,"quantity":2},{"order_id":6,"customer_id":6,"order_date":"2021-01-19","item_id":6,"quantity":3},{"order_id":7,"customer_id":5,"order_date":"2021-02-14","item_id":1,"quantity":9},{"order_id":8,"customer_id":5,"order_date":"2021-03-13","item_id":3,"quantity":2},{"order_id":9,"customer_id":1,"order_date":"2021-02-18","item_id":8,"quantity":0},{"order_id":10,"customer_id":2,"order_date":"2021-01-21","item_id":6,"quantity":4},{"order_id":11,"customer_id":1,"order_date":"2021-01-11","item_id":9,"quantity":4},{"order_id":12,"customer_id":1,"order_date":"2021-02-13","item_id":8,"quantity":3},{"order_id":13,"customer_id":3,"order_date":"2021-01-12","item_id":8,"quantity":5},{"order_id":14,"customer_id":3,"order_date":"2021-01-21","item_id":9,"quantity":3},{"order_id":15,"customer_id":6,"order_date":"2021-03-15","item_id":11,"quantity":1},{"order_id":16,"customer_id":2,"order_date":"2021-01-13","item_id":8,"quantity":1},{"order_id":17,"customer_id":1,"order_date":"2021-03-24","item_id":1,"quantity":2},{"order_id":18,"customer_id":6,"order_date":"2021-02-20","item_id":1,"quantity":7},{"order_id":19,"customer_id":3,"order_date":"2021-02-21","item_id":1,"quantity":4},{"order_id":20,"customer_id":2,"order_date":"2021-02-18","item_id":9,"quantity":1}]}' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'left', color: 'var(--text)' }

// The stage strip shows where the query is; the table shows the rows held at this stage.
// Rows that were not in the previous stage are marked "new".
function StageTable({ run, step, phases }) {
  const view = step.view || {}
  const caption = view.caption || step.caption || 'Current rows'
  const rows = view.rows || step.rows || []
  const columns = view.columns || step.columns || (rows[0] ? Object.keys(rows[0]) : [])
  const index = run.frames.indexOf(step)
  const prior = index > 0 ? run.frames[index - 1] : null
  const previous = prior ? (prior.view?.rows || prior.rows || []) : []
  const seen = new Set(previous.map(row => JSON.stringify(row)))
  return <section aria-label="Current table">
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{phases.map(p => <span key={p.id} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)', background: p.id === step.phase ? 'var(--primary)' : 'var(--surface2)', color: p.id === step.phase ? '#fff' : 'var(--text)' }}>{p.label}</span>)}</div>
    <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--text)' }}>{caption}</h3>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, color: 'var(--text)' }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}<th style={cell}>change</th></tr></thead>
      <tbody>{rows.length
        ? rows.map((row, i) => {
          const isNew = !seen.has(JSON.stringify(row))
          return <tr key={i} style={{ background: isNew ? 'var(--surface2)' : 'transparent' }}>
            {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}
            <td style={cell}>{isNew ? 'new' : ''}</td>
          </tr>
        })
        : <tr><td style={cell} colSpan={columns.length + 1}>No rows</td></tr>}</tbody>
    </table>
  </section>
}

export default function SalesByDayOfTheWeek() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <StageTable run={run} step={step} phases={definition.phases} />
  </>} renderReasoning={() => <>
    <p>Sample tables are invented for this walkthrough.</p>
    <p>Each order gets a weekday from its date. Quantities are then summed per category and per weekday, so every category has seven columns even when a day is empty.</p>
  </>} />
}
