import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Accounts', description: 'Read the accounts in id order.' },
  { id: 'scan', label: 'Scan', description: 'Find the longest run of consecutive login days for one account.' },
  { id: 'done', label: 'Result', description: 'Return the accounts with a run of five or more days.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  number: '1454', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Accounts ({ id, name }) and Logins ({ id, login_date }) lists; dates are YYYY-MM-DD',
  url: 'https://leetcode.com/problems/active-users/',
  complexity: 'O(L log L) to sort the logins, then one pass per account.',
  examples: [
    { label: 'Example', input: '{"Accounts":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"},{"id":3,"name":"Carl"}],"Logins":[{"id":1,"login_date":"2020-01-01"},{"id":1,"login_date":"2020-01-02"},{"id":1,"login_date":"2020-01-03"},{"id":1,"login_date":"2020-01-03"},{"id":1,"login_date":"2020-01-04"},{"id":1,"login_date":"2020-01-05"},{"id":2,"login_date":"2020-01-01"},{"id":2,"login_date":"2020-01-02"},{"id":2,"login_date":"2020-01-03"},{"id":2,"login_date":"2020-01-05"},{"id":2,"login_date":"2020-01-06"},{"id":3,"login_date":"2020-02-27"},{"id":3,"login_date":"2020-02-28"},{"id":3,"login_date":"2020-02-29"},{"id":3,"login_date":"2020-03-01"},{"id":3,"login_date":"2020-03-02"}]}' },
  ],
}

export default function ActiveUsers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Repeated logins on one day are merged. Consecutive days are measured as calendar-day differences, so a run can cross a month or leap day.</p>
  </>} />
}
