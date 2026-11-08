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
  inputLabel: 'Flights and passengers as JSON',
  url: 'https://leetcode.com/problems/flight-occupancy-and-waitlist-analysis/',
  complexity: 'Walkthrough: one count per flight, then a clamp against capacity.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }, { label: 'Flight with no passengers', input: '{"flights":[{"flight_id":1,"capacity":0}],"passengers":[]}' }, { label: 'Tie: exactly full flight', input: '{"flights":[{"flight_id":1,"capacity":2}],"passengers":[{"passenger_id":1,"flight_id":1},{"passenger_id":2,"flight_id":1}]}' }, { label: 'Boundary: zero capacity with a passenger', input: '{"flights":[{"flight_id":9,"capacity":0}],"passengers":[{"passenger_id":5,"flight_id":9}]}' }, { label: 'Long run: 12 flights, 40 passengers', input: '{"flights":[{"flight_id":1,"capacity":4},{"flight_id":2,"capacity":1},{"flight_id":3,"capacity":3},{"flight_id":4,"capacity":5},{"flight_id":5,"capacity":2},{"flight_id":6,"capacity":5},{"flight_id":7,"capacity":2},{"flight_id":8,"capacity":1},{"flight_id":9,"capacity":6},{"flight_id":10,"capacity":6},{"flight_id":11,"capacity":4},{"flight_id":12,"capacity":6}],"passengers":[{"passenger_id":1,"flight_id":3},{"passenger_id":2,"flight_id":8},{"passenger_id":3,"flight_id":5},{"passenger_id":4,"flight_id":8},{"passenger_id":5,"flight_id":1},{"passenger_id":6,"flight_id":8},{"passenger_id":7,"flight_id":12},{"passenger_id":8,"flight_id":5},{"passenger_id":9,"flight_id":11},{"passenger_id":10,"flight_id":9},{"passenger_id":11,"flight_id":12},{"passenger_id":12,"flight_id":1},{"passenger_id":13,"flight_id":12},{"passenger_id":14,"flight_id":10},{"passenger_id":15,"flight_id":12},{"passenger_id":16,"flight_id":5},{"passenger_id":17,"flight_id":7},{"passenger_id":18,"flight_id":2},{"passenger_id":19,"flight_id":1},{"passenger_id":20,"flight_id":1},{"passenger_id":21,"flight_id":12},{"passenger_id":22,"flight_id":8},{"passenger_id":23,"flight_id":12},{"passenger_id":24,"flight_id":4},{"passenger_id":25,"flight_id":12},{"passenger_id":26,"flight_id":4},{"passenger_id":27,"flight_id":8},{"passenger_id":28,"flight_id":11},{"passenger_id":29,"flight_id":2},{"passenger_id":30,"flight_id":9},{"passenger_id":31,"flight_id":1},{"passenger_id":32,"flight_id":1},{"passenger_id":33,"flight_id":9},{"passenger_id":34,"flight_id":2},{"passenger_id":35,"flight_id":8},{"passenger_id":36,"flight_id":10},{"passenger_id":37,"flight_id":6},{"passenger_id":38,"flight_id":7},{"passenger_id":39,"flight_id":6},{"passenger_id":40,"flight_id":6}]}' } ],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function FlightOccupancy() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SqlStageBoard title={`${meta.title}: query stages`} stages={stagesOf(run)} active={run.frames.indexOf(step)} />} renderReasoning={() => <>
    <p>Walkthrough of the query with invented sample tables.</p>
    <p>A flight with no passengers still appears, because the join starts from the flights table.</p>
    <p>Booked seats are the smaller of the count and the capacity; the rest are waitlisted.</p>
  </>} />
}
