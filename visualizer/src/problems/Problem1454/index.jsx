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
    { label: 'One account, one login', input: '{"Accounts":[{"id":1,"name":"Ada"}],"Logins":[{"id":1,"login_date":"2020-01-01"}]}' },
    { label: 'Same day twice', input: '{"Accounts":[{"id":1,"name":"Ada"}],"Logins":[{"id":1,"login_date":"2020-01-01"},{"id":1,"login_date":"2020-01-01"}]}' },
    { label: 'Largest: 12 accounts, 60 logins', input: '{"Accounts":[{"id":1,"name":"U0"},{"id":2,"name":"U1"},{"id":3,"name":"U2"},{"id":4,"name":"U3"},{"id":5,"name":"U4"},{"id":6,"name":"U5"},{"id":7,"name":"U6"},{"id":8,"name":"U7"},{"id":9,"name":"U8"},{"id":10,"name":"U9"},{"id":11,"name":"U10"},{"id":12,"name":"U11"}],"Logins":[{"id":1,"login_date":"2020-01-01"},{"id":2,"login_date":"2020-02-02"},{"id":3,"login_date":"2020-03-03"},{"id":4,"login_date":"2020-01-04"},{"id":5,"login_date":"2020-02-05"},{"id":6,"login_date":"2020-03-06"},{"id":7,"login_date":"2020-01-07"},{"id":8,"login_date":"2020-02-08"},{"id":9,"login_date":"2020-03-09"},{"id":10,"login_date":"2020-01-10"},{"id":11,"login_date":"2020-02-11"},{"id":12,"login_date":"2020-03-12"},{"id":1,"login_date":"2020-01-13"},{"id":2,"login_date":"2020-02-14"},{"id":3,"login_date":"2020-03-15"},{"id":4,"login_date":"2020-01-16"},{"id":5,"login_date":"2020-02-17"},{"id":6,"login_date":"2020-03-18"},{"id":7,"login_date":"2020-01-19"},{"id":8,"login_date":"2020-02-20"},{"id":9,"login_date":"2020-03-21"},{"id":10,"login_date":"2020-01-22"},{"id":11,"login_date":"2020-02-23"},{"id":12,"login_date":"2020-03-24"},{"id":1,"login_date":"2020-01-25"},{"id":2,"login_date":"2020-02-26"},{"id":3,"login_date":"2020-03-27"},{"id":4,"login_date":"2020-01-28"},{"id":5,"login_date":"2020-02-01"},{"id":6,"login_date":"2020-03-02"},{"id":7,"login_date":"2020-01-03"},{"id":8,"login_date":"2020-02-04"},{"id":9,"login_date":"2020-03-05"},{"id":10,"login_date":"2020-01-06"},{"id":11,"login_date":"2020-02-07"},{"id":12,"login_date":"2020-03-08"},{"id":1,"login_date":"2020-01-09"},{"id":2,"login_date":"2020-02-10"},{"id":3,"login_date":"2020-03-11"},{"id":4,"login_date":"2020-01-12"},{"id":5,"login_date":"2020-02-13"},{"id":6,"login_date":"2020-03-14"},{"id":7,"login_date":"2020-01-15"},{"id":8,"login_date":"2020-02-16"},{"id":9,"login_date":"2020-03-17"},{"id":10,"login_date":"2020-01-18"},{"id":11,"login_date":"2020-02-19"},{"id":12,"login_date":"2020-03-20"},{"id":1,"login_date":"2020-01-21"},{"id":2,"login_date":"2020-02-22"},{"id":3,"login_date":"2020-03-23"},{"id":4,"login_date":"2020-01-24"},{"id":5,"login_date":"2020-02-25"},{"id":6,"login_date":"2020-03-26"},{"id":7,"login_date":"2020-01-27"},{"id":8,"login_date":"2020-02-28"},{"id":9,"login_date":"2020-03-01"},{"id":10,"login_date":"2020-01-02"},{"id":11,"login_date":"2020-02-03"},{"id":12,"login_date":"2020-03-04"}]}' },
    { label: 'Long run: 60 logins', input: '{"Accounts":[{"id":1,"name":"U0"},{"id":2,"name":"U1"},{"id":3,"name":"U2"},{"id":4,"name":"U3"},{"id":5,"name":"U4"},{"id":6,"name":"U5"},{"id":7,"name":"U6"},{"id":8,"name":"U7"},{"id":9,"name":"U8"},{"id":10,"name":"U9"},{"id":11,"name":"U10"},{"id":12,"name":"U11"}],"Logins":[{"id":5,"login_date":"2020-02-15"},{"id":6,"login_date":"2020-02-04"},{"id":3,"login_date":"2020-02-01"},{"id":3,"login_date":"2020-03-17"},{"id":4,"login_date":"2020-01-09"},{"id":8,"login_date":"2020-01-03"},{"id":3,"login_date":"2020-02-16"},{"id":5,"login_date":"2020-01-04"},{"id":7,"login_date":"2020-02-03"},{"id":5,"login_date":"2020-01-06"},{"id":4,"login_date":"2020-03-10"},{"id":4,"login_date":"2020-03-15"},{"id":12,"login_date":"2020-01-20"},{"id":6,"login_date":"2020-01-01"},{"id":8,"login_date":"2020-02-06"},{"id":3,"login_date":"2020-03-08"},{"id":7,"login_date":"2020-02-18"},{"id":8,"login_date":"2020-03-28"},{"id":10,"login_date":"2020-01-09"},{"id":10,"login_date":"2020-02-26"},{"id":12,"login_date":"2020-02-02"},{"id":5,"login_date":"2020-01-04"},{"id":10,"login_date":"2020-01-13"},{"id":6,"login_date":"2020-02-24"},{"id":11,"login_date":"2020-02-10"},{"id":4,"login_date":"2020-03-17"},{"id":11,"login_date":"2020-02-25"},{"id":10,"login_date":"2020-01-01"},{"id":3,"login_date":"2020-01-04"},{"id":3,"login_date":"2020-01-10"},{"id":4,"login_date":"2020-02-02"},{"id":10,"login_date":"2020-03-06"},{"id":7,"login_date":"2020-03-06"},{"id":6,"login_date":"2020-02-28"},{"id":11,"login_date":"2020-01-08"},{"id":7,"login_date":"2020-03-12"},{"id":12,"login_date":"2020-03-18"},{"id":12,"login_date":"2020-01-15"},{"id":9,"login_date":"2020-02-02"},{"id":2,"login_date":"2020-03-14"},{"id":10,"login_date":"2020-03-09"},{"id":1,"login_date":"2020-02-02"},{"id":2,"login_date":"2020-03-11"},{"id":5,"login_date":"2020-03-05"},{"id":8,"login_date":"2020-02-02"},{"id":1,"login_date":"2020-03-16"},{"id":2,"login_date":"2020-03-24"},{"id":8,"login_date":"2020-02-20"},{"id":1,"login_date":"2020-02-07"},{"id":3,"login_date":"2020-01-03"},{"id":5,"login_date":"2020-03-06"},{"id":6,"login_date":"2020-01-12"},{"id":12,"login_date":"2020-01-20"},{"id":11,"login_date":"2020-01-28"},{"id":12,"login_date":"2020-02-07"},{"id":6,"login_date":"2020-01-03"},{"id":7,"login_date":"2020-01-07"},{"id":3,"login_date":"2020-01-15"},{"id":2,"login_date":"2020-02-05"},{"id":7,"login_date":"2020-01-25"}]}' },
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
