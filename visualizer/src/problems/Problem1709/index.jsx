import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const END = '2021-01-01'
const DAY = 86400000
const dayNumber = text => Date.parse(`${text}T00:00:00Z`) / DAY

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption style={{ textAlign: 'left', color: 'var(--text)', marginBottom: 4 }}>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

// One line per user on a shared day axis. Each visit is a tick; the window to the next visit (or to the end date)
// is a bar. Bars are solid once their window has been measured in this step.
function Timeline({ visits, windows }) {
  if (visits.length === 0) return null
  const days = visits.map(v => dayNumber(v.visit_date))
  const start = Math.min(...days)
  const span = Math.max(1, dayNumber(END) - start)
  const pct = d => `${((d - start) / span) * 100}%`
  const users = [...new Set(visits.map(v => v.user_id))].sort((a, b) => a - b)
  const measured = new Set(windows.map(w => `${w.user_id}|${w.visit_date}`))
  return <div role="img" aria-label="Visits on a day axis" style={{ display: 'grid', gap: 8, width: '100%' }}>
    {users.map(user => {
      const list = visits.filter(v => v.user_id === user).sort((a, b) => (a.visit_date < b.visit_date ? -1 : a.visit_date > b.visit_date ? 1 : 0))
      return <div key={user} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>user {user}</span>
        <div style={{ position: 'relative', height: 26, borderBottom: '1px solid var(--border)' }}>
          {list.map((v, k) => {
            const from = dayNumber(v.visit_date)
            const to = k + 1 < list.length ? dayNumber(list[k + 1].visit_date) : dayNumber(END)
            const done = measured.has(`${user}|${v.visit_date}`)
            return <span key={k}>
              <span style={{ position: 'absolute', top: 10, left: pct(from), width: `${((to - from) / span) * 100}%`, height: 6,
                background: done ? 'var(--primary)' : 'transparent', border: done ? 'none' : '1px dashed var(--text-muted, var(--text))', boxSizing: 'border-box' }} />
              <span title={v.visit_date} style={{ position: 'absolute', left: pct(from), top: 0, width: 2, height: 26, background: 'var(--text)', transform: 'translateX(-1px)' }} />
            </span>
          })}
          <span style={{ position: 'absolute', left: pct(dayNumber(END)), top: 0, width: 2, height: 26, background: 'var(--text-muted, var(--text))', transform: 'translateX(-1px)' }} />
        </div>
      </div>
    })}
    <span style={{ justifySelf: 'end', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted, var(--text))' }}>end date {END} (right edge)</span>
  </div>
}

const definition = {
  number: meta.number, phases: [
    { id: 'load', label: 'Visits', description: 'Read every visit with its user and date.' },
    { id: 'window', label: 'Windows', description: 'Measure each visit to the next visit of the same user, or to 2021-01-01.' },
    { id: 'done', label: 'Result', description: 'Keep the largest window for each user.' },
  ], parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a UserVisits list of { user_id, visit_date } rows; dates are YYYY-MM-DD on or before 2021-01-01',
  url: 'https://leetcode.com/problems/biggest-window-between-visits/',
  complexity: 'O(n log n) to sort the visits by user and date, then one pass for the windows.',
  examples: [
    { label: 'Example', input: '{"UserVisits":[{"user_id":2,"visit_date":"2020-06-15"},{"user_id":1,"visit_date":"2020-12-01"},{"user_id":3,"visit_date":"2020-12-31"},{"user_id":1,"visit_date":"2020-01-01"},{"user_id":3,"visit_date":"2020-12-31"},{"user_id":1,"visit_date":"2020-01-11"}]}' },
  { label: 'One visit', input: '{"UserVisits":[{"user_id":4,"visit_date":"2020-05-05"}]}' },
  { label: 'Same date twice', input: '{"UserVisits":[{"user_id":1,"visit_date":"2020-03-03"},{"user_id":1,"visit_date":"2020-03-03"}]}' },
  { label: 'Visit on the window end', input: '{"UserVisits":[{"user_id":2,"visit_date":"2021-01-01"},{"user_id":2,"visit_date":"2020-12-31"}]}' },
  { label: 'Long run: 12 visits', input: '{"UserVisits":[{"user_id":4,"visit_date":"2020-04-28"},{"user_id":4,"visit_date":"2020-05-13"},{"user_id":4,"visit_date":"2020-05-26"},{"user_id":4,"visit_date":"2020-03-03"},{"user_id":1,"visit_date":"2020-07-07"},{"user_id":1,"visit_date":"2020-06-09"},{"user_id":3,"visit_date":"2020-02-17"},{"user_id":2,"visit_date":"2020-10-23"},{"user_id":3,"visit_date":"2020-04-07"},{"user_id":3,"visit_date":"2020-06-04"},{"user_id":3,"visit_date":"2020-02-19"},{"user_id":3,"visit_date":"2020-02-17"}]}' },
  ],
}

export default function BiggestWindowBetweenVisits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <Timeline visits={run.input.UserVisits} windows={step.phase === 'done' ? run.input.UserVisits : step.phase === 'window' ? step.rows : []} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
      <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
    </div>
  </>} renderReasoning={() => <>
    <p>Sorting each user's visits by date makes every window a difference between a visit and the next one, so the last visit is measured to the fixed end date.</p>
    <p>The biggest window for a user is the largest of their measured windows.</p>
  </>} />
}
