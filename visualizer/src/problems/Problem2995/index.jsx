import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Sessions table'
const complexity = 'O(s * u) for s sessions and u users in the teaching loop. The visualizer caps Sessions at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Sessions":[{"user_id":1,"session_start":"2024-01-01 10:00:00","session_end":"2024-01-01 11:00:00","session_id":101,"session_type":"Viewer"},{"user_id":1,"session_start":"2024-01-02 09:00:00","session_end":"2024-01-02 10:00:00","session_id":102,"session_type":"Streamer"},{"user_id":1,"session_start":"2024-01-03 09:00:00","session_end":"2024-01-03 10:00:00","session_id":103,"session_type":"Streamer"},{"user_id":2,"session_start":"2024-01-01 08:00:00","session_end":"2024-01-01 09:00:00","session_id":201,"session_type":"Streamer"},{"user_id":2,"session_start":"2024-01-04 08:00:00","session_end":"2024-01-04 09:00:00","session_id":202,"session_type":"Viewer"},{"user_id":3,"session_start":"2024-01-05 12:00:00","session_end":"2024-01-05 13:00:00","session_id":301,"session_type":"Viewer"},{"user_id":4,"session_start":"2024-01-01 12:00:00","session_end":"2024-01-01 13:00:00","session_id":401,"session_type":"Viewer"},{"user_id":4,"session_start":"2024-01-04 12:00:00","session_end":"2024-01-04 13:00:00","session_id":402,"session_type":"Viewer"},{"user_id":4,"session_start":"2024-01-06 15:00:00","session_end":"2024-01-06 16:00:00","session_id":403,"session_type":"Streamer"},{"user_id":5,"session_start":"2024-01-02 07:00:00","session_end":"2024-01-02 08:00:00","session_id":501,"session_type":"Streamer"},{"user_id":5,"session_start":"2024-01-03 07:00:00","session_end":"2024-01-03 08:00:00","session_id":502,"session_type":"Streamer"}]}',
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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>The query first finds each user's earliest session, keeps the users who began as viewers, and counts streamer sessions that start after that first session. Users with no later streaming are dropped.</p>} />
}
