import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const stagesOf = run => run.frames.map(f => ({
  id: f.phase, clause: code[f.activeLine - 1]?.text.trim() ?? '', label: phases.find(p => p.id === f.phase)?.label ?? f.phase,
  columns: f.columns, rows: f.rows,
}))

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Flights and bookings as JSON',
  url: 'https://leetcode.com/problems/status-of-flight-tickets/',
  complexity: 'Walkthrough: one ordering by flight and time, then a row-number check.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }, { label: 'Single booking', input: '{"flights":[{"flight_id":1,"capacity":1}],"passengers":[{"passenger_id":1,"flight_id":1,"booking_time":4}]}' }, { label: 'Tie: same booking time, one seat', input: '{"flights":[{"flight_id":1,"capacity":1}],"passengers":[{"passenger_id":1,"flight_id":1,"booking_time":5},{"passenger_id":2,"flight_id":1,"booking_time":5}]}' }, { label: 'Boundary: zero capacity flight', input: '{"flights":[{"flight_id":3,"capacity":0}],"passengers":[{"passenger_id":7,"flight_id":3,"booking_time":1}]}' }, { label: 'Long run: 30 passengers on 3 flights', input: '{"flights":[{"flight_id":1,"capacity":4},{"flight_id":2,"capacity":6},{"flight_id":3,"capacity":3}],"passengers":[{"passenger_id":1,"flight_id":3,"booking_time":470},{"passenger_id":2,"flight_id":3,"booking_time":384},{"passenger_id":3,"flight_id":3,"booking_time":402},{"passenger_id":4,"flight_id":1,"booking_time":14},{"passenger_id":5,"flight_id":2,"booking_time":29},{"passenger_id":6,"flight_id":2,"booking_time":302},{"passenger_id":7,"flight_id":2,"booking_time":368},{"passenger_id":8,"flight_id":3,"booking_time":356},{"passenger_id":9,"flight_id":2,"booking_time":397},{"passenger_id":10,"flight_id":2,"booking_time":106},{"passenger_id":11,"flight_id":1,"booking_time":340},{"passenger_id":12,"flight_id":3,"booking_time":359},{"passenger_id":13,"flight_id":1,"booking_time":69},{"passenger_id":14,"flight_id":2,"booking_time":183},{"passenger_id":15,"flight_id":1,"booking_time":410},{"passenger_id":16,"flight_id":3,"booking_time":500},{"passenger_id":17,"flight_id":2,"booking_time":397},{"passenger_id":18,"flight_id":3,"booking_time":298},{"passenger_id":19,"flight_id":2,"booking_time":228},{"passenger_id":20,"flight_id":3,"booking_time":427},{"passenger_id":21,"flight_id":2,"booking_time":140},{"passenger_id":22,"flight_id":1,"booking_time":142},{"passenger_id":23,"flight_id":3,"booking_time":14},{"passenger_id":24,"flight_id":2,"booking_time":6},{"passenger_id":25,"flight_id":1,"booking_time":114},{"passenger_id":26,"flight_id":2,"booking_time":262},{"passenger_id":27,"flight_id":2,"booking_time":170},{"passenger_id":28,"flight_id":1,"booking_time":135},{"passenger_id":29,"flight_id":3,"booking_time":45},{"passenger_id":30,"flight_id":1,"booking_time":295}]}' } ],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function TicketStatus() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SqlStageBoard title={`${meta.title}: query stages`} stages={stagesOf(run)} active={run.frames.indexOf(step)} />} renderReasoning={() => <>
    <p>Walkthrough of the query with invented sample tables.</p>
    <p>Bookings are numbered in time order within each flight.</p>
    <p>A booking is confirmed when its arrival number is no more than the flight capacity.</p>
  </>} />
}
