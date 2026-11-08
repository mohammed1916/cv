import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Bikes table (ride_id, bike_number, start_time, end_time)'
const complexity = 'O(n) over the ride rows plus a sort of the bikes. The visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Bikes":[{"ride_id":1,"bike_number":7,"start_time":"2025-03-01 08:00:00","end_time":"2025-03-01 08:20:00"},{"ride_id":2,"bike_number":3,"start_time":"2025-03-01 09:00:00","end_time":"2025-03-01 10:15:00"},{"ride_id":3,"bike_number":7,"start_time":"2025-03-02 07:00:00","end_time":"2025-03-02 07:40:00"},{"ride_id":4,"bike_number":9,"start_time":"2025-02-28 12:00:00","end_time":"2025-02-28 12:30:00"},{"ride_id":5,"bike_number":3,"start_time":"2025-03-01 11:00:00","end_time":"2025-03-01 11:05:00"}]}',
}, {
  label: 'Single ride',
  input: '{"Bikes":[{"ride_id":1,"bike_number":4,"start_time":"2025-05-01 10:00:00","end_time":"2025-05-01 10:05:00"}]}',
}, {
  label: 'Equal end times',
  input: '{"Bikes":[{"ride_id":1,"bike_number":2,"start_time":"2025-05-01 10:00:00","end_time":"2025-05-01 11:00:00"},{"ride_id":2,"bike_number":5,"start_time":"2025-05-01 10:30:00","end_time":"2025-05-01 11:00:00"}]}',
}, {
  label: 'Long run: 12 rides on 4 bikes',
  input: '{"Bikes":[{"ride_id":1,"bike_number":4,"start_time":"2025-05-01 08:00:00","end_time":"2025-05-01 08:30:00"},{"ride_id":2,"bike_number":9,"start_time":"2025-05-02 09:00:00","end_time":"2025-05-02 09:30:00"},{"ride_id":3,"bike_number":2,"start_time":"2025-05-03 10:00:00","end_time":"2025-05-03 10:30:00"},{"ride_id":4,"bike_number":7,"start_time":"2025-05-01 11:00:00","end_time":"2025-05-01 11:30:00"},{"ride_id":5,"bike_number":9,"start_time":"2025-05-02 12:00:00","end_time":"2025-05-02 12:30:00"},{"ride_id":6,"bike_number":4,"start_time":"2025-05-03 13:00:00","end_time":"2025-05-03 13:30:00"},{"ride_id":7,"bike_number":2,"start_time":"2025-05-01 14:00:00","end_time":"2025-05-01 14:30:00"},{"ride_id":8,"bike_number":7,"start_time":"2025-05-02 15:00:00","end_time":"2025-05-02 15:30:00"},{"ride_id":9,"bike_number":7,"start_time":"2025-05-03 16:00:00","end_time":"2025-05-03 16:30:00"},{"ride_id":10,"bike_number":9,"start_time":"2025-05-01 17:00:00","end_time":"2025-05-01 17:30:00"},{"ride_id":11,"bike_number":4,"start_time":"2025-05-02 18:00:00","end_time":"2025-05-02 18:30:00"},{"ride_id":12,"bike_number":2,"start_time":"2025-05-03 19:00:00","end_time":"2025-05-03 19:30:00"}]}',
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

// One chip per SQL stage, in the order the query runs, with the current stage filled.
function StageStrip({ phases = [], current }) {
  const at = Math.max(0, phases.findIndex(p => p.id === current))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((p, i) => <li key={p.id} aria-current={p.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
      border: p.id === current ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i <= at ? 'var(--primary-glow)' : 'var(--surface)', opacity: i <= at ? 1 : 0.6,
    }}>{p.label}</li>)}
  </ol>
}

export default function BikesLastTimeUsed() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
