import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, sql, sample } from './algorithm'

const inputLabel = 'Orders as a JSON list of {minute, order_count} rows, minute running 1..n with n a multiple of 6'
const complexity = 'O(n) time and O(n / 6) extra space: one pass over the rows and one total per interval.'
const examples = [
  { label: 'Two intervals', input: JSON.stringify(sample) },
  { label: 'One interval', input: JSON.stringify([7, 1, 0, 3, 2, 2].map((order_count, i) => ({ minute: i + 1, order_count }))) },
]
const reasoning = <>
  <p>Each minute belongs to a six-minute interval: minute m is in interval (m + 5) div 6. Adding the order counts that share an interval number gives its total.</p>
  <pre><code>{sql}</code></pre>
</>

const definition = { phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples }

const cell = { padding: '4px 8px', borderBottom: '1px solid var(--surface2)', color: 'var(--text)', textAlign: 'left' }

export default function CalculateOrdersWithinEachInterval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const rows = run.input
    const intervals = rows.length / 6
    return <>
      <table aria-label="Orders table with interval numbers" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr>{['minute', 'order_count', 'interval_no'].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => {
          const interval = Math.floor((row.minute + 5) / 6)
          const isCurrent = i === step.cursor
          const isRead = step.cursor >= 0 && i <= step.cursor
          return <tr key={row.minute} data-interval={interval} data-current={isCurrent}
            style={{ background: isCurrent ? 'var(--primary)' : interval % 2 === 0 ? 'var(--surface2)' : 'transparent', color: isCurrent ? '#fff' : 'var(--text)', opacity: isRead || step.cursor < 0 ? 1 : 0.6 }}>
            <td style={cell}>{row.minute}</td><td style={cell}>{row.order_count}</td><td style={cell}>{interval}</td>
          </tr>
        })}</tbody>
      </table>
      <table aria-label="Interval totals so far" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr>{['interval_no', 'minutes read', 'total_orders so far'].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
        <tbody>{Array.from({ length: intervals }, (_, k) => {
          const read = rows.slice(0, step.cursor + 1).filter(row => Math.floor((row.minute + 5) / 6) === k + 1).length
          return <tr key={k} data-current={step.interval === k + 1}>
            <td style={cell}>{k + 1}</td><td style={cell}>{`${read} of 6`}</td><td style={cell}><strong>{step.totals[k]}</strong></td>
          </tr>
        })}</tbody>
      </table>
      <output aria-label="Interval step" style={{ color: 'var(--text)' }}>{step.message}</output>
    </>
  }} renderReasoning={() => reasoning} />
}
