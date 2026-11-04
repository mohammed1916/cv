import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'

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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Each month: the outline is the drivers available by month end; the fill is how many of them were working that month.
function AvailabilityBars({ rows }) {
  const withCounts = rows.filter(row => typeof row.available === 'number')
  if (withCounts.length === 0) return null
  const max = Math.max(1, ...withCounts.map(row => row.available))
  return <section aria-label="Available and working drivers by month">
    <h4>Available (outline) and working (fill) drivers</h4>
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, borderBottom: '1px solid var(--border)' }}>
      {withCounts.map(row => <div key={row.month} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
        <div style={{ position: 'relative', width: 26, height: 90 * (row.available / max), minHeight: 2, border: '1px solid var(--text-muted)', boxSizing: 'border-box' }}>
          {typeof row.working === 'number' && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${row.available ? (row.working / row.available) * 100 : 0}%`, background: 'var(--primary)' }} />}
        </div>
        <small style={{ color: 'var(--text-muted)' }}>{MONTHS[row.month - 1]}</small>
        {row.working_percentage !== null && row.working_percentage !== undefined && <strong style={{ color: 'var(--text)' }}>{row.working_percentage}%</strong>}
      </div>)}
    </div>
  </section>
}

export default function HopperCompanyQueriesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AvailabilityBars rows={step.rows} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>For every month of 2020, the query counts the drivers who had joined by that month's last day, and the distinct drivers with an accepted ride requested in that month.</p>
    <p>The working percentage is that second count divided by the first, times 100, rounded to two decimals. A month with no available drivers reports 0.</p>
  </>} />
}
