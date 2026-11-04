import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sampleText } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every activity row.' },
    { id: 'days', label: 'Days', description: 'Keep only user-days with one action.' },
    { id: 'run', label: 'Runs', description: 'Join consecutive dates with the same action.' },
    { id: 'choose', label: 'Choose', description: 'Pick each user best run.' },
    { id: 'order', label: 'Order', description: 'Sort by length, then user.' },
    { id: 'done', label: 'Result', description: 'Report the rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an activity list of user_id, action_date (YYYY-MM-DD) and action',
  url: 'https://leetcode.com/problems/find-users-with-persistent-behavior-patterns/',
  complexity: 'O(a log a) for a activity rows, plus a scan of the runs.',
  examples: [{ label: 'Sample', input: sampleText }],
}

const dayNumber = date => Date.parse(`${date}T00:00:00Z`) / 86400000
const dateOf = number => new Date(number * 86400000).toISOString().slice(0, 10)

// One row per user, one column per calendar day. Single-action days show their action letter,
// days with several actions show a cross, and the run being joined is outlined.
function Timeline({ rows, focus }) {
  if (!rows.length) return null
  const first = Math.min(...rows.map(r => dayNumber(r.action_date)))
  const last = Math.max(...rows.map(r => dayNumber(r.action_date)))
  const days = Array.from({ length: last - first + 1 }, (_, k) => first + k)
  const users = [...new Set(rows.map(r => r.user_id))].sort((a, b) => a - b)
  const cellOf = new Map()
  for (const row of rows) {
    const key = `${row.user_id}|${dayNumber(row.action_date)}`
    cellOf.set(key, cellOf.has(key) && cellOf.get(key) !== row.action ? '×' : row.action[0])
  }
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Activity timeline by user and day">
    <table className="persistent-timeline">
      <caption>Each cell is one user on one day: the action initial, × for several actions, blank for no activity</caption>
      <thead><tr><th scope="col">user</th>{days.map(d => <th key={d} scope="col" style={{ fontSize: 10 }}>{dateOf(d).slice(5)}</th>)}</tr></thead>
      <tbody>{users.map(user => <tr key={user}>
        <th scope="row">{user}</th>
        {days.map(d => {
          const mark = cellOf.get(`${user}|${d}`) ?? ''
          const inFocus = focus && focus.user_id === user && d >= dayNumber(focus.start) && d <= dayNumber(focus.end)
          return <td key={d} data-run={inFocus ? 'yes' : undefined}
            style={{ textAlign: 'center', background: inFocus ? 'var(--primary)' : 'var(--surface2)', color: inFocus ? 'var(--surface)' : 'var(--text)', border: '1px solid var(--text-muted)' }}>{mark}</td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

function CurrentTable({ table }) {
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.length
        ? table.rows.map((row, index) => <tr key={index}>{table.columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={table.columns.length}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

export default function FindUsersWithPersistentBehaviorPatterns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Timeline rows={run.input.activity} focus={step.focus ?? null} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>A day counts only when a user has exactly one action on it. A run is a stretch of such days with the same action and no calendar gap.</p>
    <p>Subtracting a running count from the date gives a constant value across each run, which lets the rows be grouped into runs.</p>
  </>} />
}
