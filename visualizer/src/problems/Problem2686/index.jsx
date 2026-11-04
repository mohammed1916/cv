import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Delivery table (delivery_id, customer_id, order_date, customer_pref_delivery_date)'
const complexity = 'O(n) over the delivery rows. The visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Delivery":[{"delivery_id":1,"customer_id":1,"order_date":"2025-01-01","customer_pref_delivery_date":"2025-01-02"},{"delivery_id":2,"customer_id":2,"order_date":"2025-01-01","customer_pref_delivery_date":"2025-01-01"},{"delivery_id":3,"customer_id":3,"order_date":"2025-01-02","customer_pref_delivery_date":"2025-01-02"},{"delivery_id":4,"customer_id":4,"order_date":"2025-01-02","customer_pref_delivery_date":"2025-01-05"},{"delivery_id":5,"customer_id":5,"order_date":"2025-01-02","customer_pref_delivery_date":"2025-01-02"},{"delivery_id":6,"customer_id":6,"order_date":"2025-01-03","customer_pref_delivery_date":"2025-01-03"}]}',
}]
const reasoning = 'An order is immediate when its preferred delivery date equals its order date. Every order on a date stays in the denominator, so each date gets immediate orders divided by all orders on that date, shown as a percentage rounded to two decimals.'

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

// One chip per SQL stage, in the order the query runs, with the current stage filled.
function StageStrip({ phases = [], current }) {
  const at = Math.max(0, phases.findIndex(p => p.id === current))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((p, i) => <li key={p.id} aria-current={p.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
      border: p.id === current ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i <= at ? 'var(--primary-glow)' : 'var(--surface)', opacity: i <= at ? 1 : 0.6,
    }}>{p.label}</li>)}
  </ol>
}

export default function ImmediateFoodDelivery() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
