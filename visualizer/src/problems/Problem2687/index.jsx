import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Bikes table (ride_id, bike_number, start_time, end_time)'
const complexity = 'O(n) over the ride rows plus a sort of the bikes. The visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Bikes":[{"ride_id":1,"bike_number":7,"start_time":"2025-03-01 08:00:00","end_time":"2025-03-01 08:20:00"},{"ride_id":2,"bike_number":3,"start_time":"2025-03-01 09:00:00","end_time":"2025-03-01 10:15:00"},{"ride_id":3,"bike_number":7,"start_time":"2025-03-02 07:00:00","end_time":"2025-03-02 07:40:00"},{"ride_id":4,"bike_number":9,"start_time":"2025-02-28 12:00:00","end_time":"2025-02-28 12:30:00"},{"ride_id":5,"bike_number":3,"start_time":"2025-03-01 11:00:00","end_time":"2025-03-01 11:05:00"}]}',
}]
const reasoning = 'Each bike keeps the largest end time among its rides. The rows are then listed with the newest last-use time first, so the bike used most recently appears at the top.'

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

export default function BikesLastTimeUsed() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
