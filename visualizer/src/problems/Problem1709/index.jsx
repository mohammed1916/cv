import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const phases = [
  { id: 'load', label: 'Visits', description: 'Read every visit with its user and date.' },
  { id: 'window', label: 'Windows', description: 'Measure each visit to the next visit of the same user, or to 2021-01-01.' },
  { id: 'done', label: 'Result', description: 'Keep the largest window for each user.' },
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
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a UserVisits list of { user_id, visit_date } rows; dates are YYYY-MM-DD on or before 2021-01-01',
  url: 'https://leetcode.com/problems/biggest-window-between-visits/',
  complexity: 'O(n log n) to sort the visits by user and date, then one pass for the windows.',
  examples: [
    { label: 'Example', input: '{"UserVisits":[{"user_id":2,"visit_date":"2020-06-15"},{"user_id":1,"visit_date":"2020-12-01"},{"user_id":3,"visit_date":"2020-12-31"},{"user_id":1,"visit_date":"2020-01-01"},{"user_id":3,"visit_date":"2020-12-31"},{"user_id":1,"visit_date":"2020-01-11"}]}' },
  ],
}

export default function BiggestWindowBetweenVisits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Sorting each user's visits by date makes every window a difference between a visit and the next one, so the last visit is measured to the fixed end date.</p>
  </>} />
}
