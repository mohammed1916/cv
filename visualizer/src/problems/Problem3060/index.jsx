import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Sessions table (whole-minute start_time and end_time)'
const complexity = 'O(n) over the session rows. The visualization caps Sessions at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Sessions":[{"session_id":1,"user_id":1,"start_time":0,"end_time":10},{"session_id":2,"user_id":1,"start_time":20,"end_time":22},{"session_id":3,"user_id":1,"start_time":30,"end_time":50},{"session_id":4,"user_id":2,"start_time":0,"end_time":90},{"session_id":5,"user_id":2,"start_time":100,"end_time":130},{"session_id":6,"user_id":3,"start_time":5,"end_time":65},{"session_id":7,"user_id":3,"start_time":70,"end_time":75},{"session_id":8,"user_id":4,"start_time":0,"end_time":5}]}',
  },
]

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

export default function ActiveUsersSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The query first checks each session's length, then counts only the sessions that pass that check for each user.</p>
    <p>The HAVING clause removes users with fewer than two kept sessions, and the final output is sorted by user.</p>
  </>} />
}
