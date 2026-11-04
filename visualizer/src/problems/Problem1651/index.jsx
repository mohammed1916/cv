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

// The three-month window slides across the year: l marks its first month, r its last.
function MonthWindow({ start }) {
  if (!start) return null
  return <section aria-label="Three-month window">
    <h4>Sliding window: months {start} to {start + 2}</h4>
    <div style={{ display: 'flex', gap: 4 }}>
      {MONTHS.map((name, index) => {
        const month = index + 1
        const inWindow = month >= start && month <= start + 2
        const marker = month === start ? 'l' : month === start + 2 ? 'r' : ''
        return <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 2, flex: 1 }}>
          <small style={{ minHeight: 16, color: 'var(--text)', fontWeight: 700 }}>{marker}</small>
          <div style={{ width: '100%', textAlign: 'center', padding: '6px 0', borderRadius: 4, fontFamily: 'monospace', color: 'var(--text)',
            border: `${marker ? 2 : 1}px solid ${marker ? 'var(--primary)' : 'var(--border)'}`,
            background: inWindow ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'var(--surface2)' }}>{name}</div>
        </div>
      })}
    </div>
  </section>
}

export default function HopperCompanyQueriesIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MonthWindow start={step.windowStart} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each three-month window is built from monthly totals. The query sums the distance and duration of every accepted 2020 ride requested in those months, then divides each sum by 3.</p>
    <p>Months with no accepted rides count as 0, so an empty window still produces a row with zero averages.</p>
  </>} />
}
