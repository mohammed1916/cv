import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Accounts', description: 'Read the accounts in id order.' },
  { id: 'scan', label: 'Scan', description: 'Find the longest run of consecutive login days for one account.' },
  { id: 'done', label: 'Result', description: 'Return the accounts with a run of five or more days.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }


const definition = {
  number: '1454', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Accounts ({ id, name }) and Logins ({ id, login_date }) lists; dates are YYYY-MM-DD',
  url: 'https://leetcode.com/problems/active-users/',
  complexity: 'O(L log L) to sort the logins, then one pass per account.',
  examples: [
    { label: 'Example', input: '{"Accounts":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"},{"id":3,"name":"Carl"}],"Logins":[{"id":1,"login_date":"2020-01-01"},{"id":1,"login_date":"2020-01-02"},{"id":1,"login_date":"2020-01-03"},{"id":1,"login_date":"2020-01-03"},{"id":1,"login_date":"2020-01-04"},{"id":1,"login_date":"2020-01-05"},{"id":2,"login_date":"2020-01-01"},{"id":2,"login_date":"2020-01-02"},{"id":2,"login_date":"2020-01-03"},{"id":2,"login_date":"2020-01-05"},{"id":2,"login_date":"2020-01-06"},{"id":3,"login_date":"2020-02-27"},{"id":3,"login_date":"2020-02-28"},{"id":3,"login_date":"2020-02-29"},{"id":3,"login_date":"2020-03-01"},{"id":3,"login_date":"2020-03-02"}]}' },
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

export default function ActiveUsers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <StageTable run={run} step={step} phases={definition.phases} />
  </>} renderReasoning={() => <>
    <p>Sample tables are invented for this walkthrough.</p>
    <p>Repeated logins on one day are merged. Consecutive days are measured as calendar-day differences, so a run can cross a month or leap day.</p>
  </>} />
}
