import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, sql, sample } from './algorithm'

const inputLabel = 'Orders as a JSON list of {minute, order_count} rows, minute running 1..n with n a multiple of 6'
const complexity = 'O(n) time and O(n / 6) extra space: one pass over the rows and one total per interval.'
const examples = [
  { label: 'Two intervals', input: JSON.stringify(sample) },
  { label: 'One interval', input: JSON.stringify([7, 1, 0, 3, 2, 2].map((order_count, i) => ({ minute: i + 1, order_count }))) },
  { label: "Zero orders in one interval", input: "[{\"minute\":1,\"order_count\":0},{\"minute\":2,\"order_count\":0},{\"minute\":3,\"order_count\":0},{\"minute\":4,\"order_count\":0},{\"minute\":5,\"order_count\":0},{\"minute\":6,\"order_count\":0}]" },
  { label: "Equal counts in every minute", input: "[{\"minute\":1,\"order_count\":4},{\"minute\":2,\"order_count\":4},{\"minute\":3,\"order_count\":4},{\"minute\":4,\"order_count\":4},{\"minute\":5,\"order_count\":4},{\"minute\":6,\"order_count\":4},{\"minute\":7,\"order_count\":4},{\"minute\":8,\"order_count\":4},{\"minute\":9,\"order_count\":4},{\"minute\":10,\"order_count\":4},{\"minute\":11,\"order_count\":4},{\"minute\":12,\"order_count\":4}]" },
  { label: "Maximum rows, 48 minutes", input: "[{\"minute\":1,\"order_count\":0},{\"minute\":2,\"order_count\":1000000},{\"minute\":3,\"order_count\":2000000},{\"minute\":4,\"order_count\":3000000},{\"minute\":5,\"order_count\":4000000},{\"minute\":6,\"order_count\":5000000},{\"minute\":7,\"order_count\":6000000},{\"minute\":8,\"order_count\":7000000},{\"minute\":9,\"order_count\":0},{\"minute\":10,\"order_count\":1000000},{\"minute\":11,\"order_count\":2000000},{\"minute\":12,\"order_count\":3000000},{\"minute\":13,\"order_count\":4000000},{\"minute\":14,\"order_count\":5000000},{\"minute\":15,\"order_count\":6000000},{\"minute\":16,\"order_count\":7000000},{\"minute\":17,\"order_count\":0},{\"minute\":18,\"order_count\":1000000},{\"minute\":19,\"order_count\":2000000},{\"minute\":20,\"order_count\":3000000},{\"minute\":21,\"order_count\":4000000},{\"minute\":22,\"order_count\":5000000},{\"minute\":23,\"order_count\":6000000},{\"minute\":24,\"order_count\":7000000},{\"minute\":25,\"order_count\":0},{\"minute\":26,\"order_count\":1000000},{\"minute\":27,\"order_count\":2000000},{\"minute\":28,\"order_count\":3000000},{\"minute\":29,\"order_count\":4000000},{\"minute\":30,\"order_count\":5000000},{\"minute\":31,\"order_count\":6000000},{\"minute\":32,\"order_count\":7000000},{\"minute\":33,\"order_count\":0},{\"minute\":34,\"order_count\":1000000},{\"minute\":35,\"order_count\":2000000},{\"minute\":36,\"order_count\":3000000},{\"minute\":37,\"order_count\":4000000},{\"minute\":38,\"order_count\":5000000},{\"minute\":39,\"order_count\":6000000},{\"minute\":40,\"order_count\":7000000},{\"minute\":41,\"order_count\":0},{\"minute\":42,\"order_count\":1000000},{\"minute\":43,\"order_count\":2000000},{\"minute\":44,\"order_count\":3000000},{\"minute\":45,\"order_count\":4000000},{\"minute\":46,\"order_count\":5000000},{\"minute\":47,\"order_count\":6000000},{\"minute\":48,\"order_count\":7000000}]" },
  { label: "Long run: 48 minutes", input: "[{\"minute\":1,\"order_count\":18},{\"minute\":2,\"order_count\":34},{\"minute\":3,\"order_count\":34},{\"minute\":4,\"order_count\":38},{\"minute\":5,\"order_count\":24},{\"minute\":6,\"order_count\":38},{\"minute\":7,\"order_count\":17},{\"minute\":8,\"order_count\":3},{\"minute\":9,\"order_count\":11},{\"minute\":10,\"order_count\":39},{\"minute\":11,\"order_count\":21},{\"minute\":12,\"order_count\":45},{\"minute\":13,\"order_count\":34},{\"minute\":14,\"order_count\":25},{\"minute\":15,\"order_count\":28},{\"minute\":16,\"order_count\":47},{\"minute\":17,\"order_count\":39},{\"minute\":18,\"order_count\":14},{\"minute\":19,\"order_count\":9},{\"minute\":20,\"order_count\":5},{\"minute\":21,\"order_count\":42},{\"minute\":22,\"order_count\":41},{\"minute\":23,\"order_count\":19},{\"minute\":24,\"order_count\":35},{\"minute\":25,\"order_count\":32},{\"minute\":26,\"order_count\":21},{\"minute\":27,\"order_count\":42},{\"minute\":28,\"order_count\":38},{\"minute\":29,\"order_count\":18},{\"minute\":30,\"order_count\":0},{\"minute\":31,\"order_count\":14},{\"minute\":32,\"order_count\":40},{\"minute\":33,\"order_count\":11},{\"minute\":34,\"order_count\":34},{\"minute\":35,\"order_count\":30},{\"minute\":36,\"order_count\":7},{\"minute\":37,\"order_count\":34},{\"minute\":38,\"order_count\":11},{\"minute\":39,\"order_count\":9},{\"minute\":40,\"order_count\":22},{\"minute\":41,\"order_count\":17},{\"minute\":42,\"order_count\":39},{\"minute\":43,\"order_count\":24},{\"minute\":44,\"order_count\":49},{\"minute\":45,\"order_count\":13},{\"minute\":46,\"order_count\":29},{\"minute\":47,\"order_count\":29},{\"minute\":48,\"order_count\":45}]" },
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
