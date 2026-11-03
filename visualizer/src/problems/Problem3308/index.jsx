import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"Drivers":[{"driver_id":1,"name":"Ana"},{"driver_id":2,"name":"Ben"},{"driver_id":3,"name":"Cy"}],"Trips":[{"trip_id":1,"driver_id":1,"distance":10,"rating":5},{"trip_id":2,"driver_id":1,"distance":5,"rating":4},{"trip_id":3,"driver_id":2,"distance":15,"rating":3},{"trip_id":4,"driver_id":2,"distance":15,"rating":4}]}'
const tie = '{"Drivers":[{"driver_id":5,"name":"Dee"},{"driver_id":6,"name":"Eli"}],"Trips":[{"trip_id":1,"driver_id":6,"distance":8,"rating":2},{"trip_id":2,"driver_id":5,"distance":8,"rating":5}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Drivers (driver_id, name) and Trips (trip_id, driver_id, distance, rating 1 to 5)',
  url: 'https://leetcode.com/problems/find-top-performing-driver/description/',
  complexity: 'O(t + d log d) for t trips and d drivers. The visualization caps the tables at 12 trips and 8 drivers.',
  examples: [
    { label: 'Two active drivers', input: sample },
    { label: 'Distance tie', input: tie },
  ],
}

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function FindTopPerformingDriver() {
  const columns = ['rank', 'driver_id', 'name', 'total_distance', 'avg_rating']
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption="Driver rows so far" columns={columns} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} ranked driver row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={() => <>
    <p>Trips are attached to drivers, then each driver gets a total distance and an average rating.</p>
    <p>Drivers are ordered by total distance. The driver id breaks ties so every rank is unique.</p>
  </>} />
}
