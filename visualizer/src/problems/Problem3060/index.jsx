import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import SessionGapLanes from './SessionGapLanes'

const inputLabel = 'Object with a Sessions table (session_start and session_end as YYYY-MM-DD HH:MM:SS)'
const complexity = 'O(n log n) to sort the sessions by user, type and start. The visualizer caps Sessions at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Sessions":[{"user_id":101,"session_start":"2023-11-01 08:00:00","session_end":"2023-11-01 09:00:00","session_id":1,"session_type":"Viewer"},{"user_id":101,"session_start":"2023-11-01 10:00:00","session_end":"2023-11-01 11:00:00","session_id":2,"session_type":"Streamer"},{"user_id":102,"session_start":"2023-11-01 13:00:00","session_end":"2023-11-01 14:00:00","session_id":3,"session_type":"Viewer"},{"user_id":102,"session_start":"2023-11-01 15:00:00","session_end":"2023-11-01 16:00:00","session_id":4,"session_type":"Viewer"},{"user_id":101,"session_start":"2023-11-02 09:00:00","session_end":"2023-11-02 10:00:00","session_id":5,"session_type":"Viewer"},{"user_id":103,"session_start":"2023-11-02 20:00:00","session_end":"2023-11-02 23:00:00","session_id":10,"session_type":"Viewer"},{"user_id":103,"session_start":"2023-11-03 09:00:00","session_end":"2023-11-03 10:00:00","session_id":11,"session_type":"Viewer"}]}',
}]

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

export default function ViewerStreamerGapSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SessionGapLanes sessions={run.input.Sessions} step={step} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>For each user and session type, the query lines every session up with the one before it, earliest first. A user qualifies when some session starts at most 12 hours after the previous session of the same type ended.</p>
    <p>Only one qualifying pair is needed, so the final list is de-duplicated and sorted by user.</p>
  </>} />
}
