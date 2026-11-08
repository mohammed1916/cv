import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"Drivers":[{"driver_id":11,"name":"Dana","accidents":2},{"driver_id":12,"name":"Eli","accidents":0},{"driver_id":13,"name":"Fay","accidents":1}],"Vehicles":[{"vehicle_id":300,"driver_id":11,"fuel_type":"Hybrid"},{"vehicle_id":301,"driver_id":12,"fuel_type":"Hybrid"},{"vehicle_id":302,"driver_id":13,"fuel_type":"Diesel"},{"vehicle_id":303,"driver_id":11,"fuel_type":"Diesel"}],"Trips":[{"trip_id":1,"vehicle_id":300,"distance":10,"rating":4},{"trip_id":2,"vehicle_id":300,"distance":20,"rating":5},{"trip_id":3,"vehicle_id":301,"distance":15,"rating":4},{"trip_id":4,"vehicle_id":301,"distance":5,"rating":5},{"trip_id":5,"vehicle_id":302,"distance":40,"rating":3},{"trip_id":6,"vehicle_id":303,"distance":40,"rating":3},{"trip_id":7,"vehicle_id":999,"distance":80,"rating":5}]}'
const oneFuel = '{"Drivers":[{"driver_id":5,"name":"Gus","accidents":4}],"Vehicles":[{"vehicle_id":50,"driver_id":5,"fuel_type":"Electric"}],"Trips":[{"trip_id":9,"vehicle_id":50,"distance":12,"rating":3}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Drivers (driver_id, name, accidents), Vehicles (vehicle_id, driver_id, fuel_type) and Trips (trip_id, vehicle_id, distance, rating)',
  url: 'https://leetcode.com/problems/find-top-performing-driver/',
  complexity: 'O(t log t) for t trips: one pass joins each trip to its vehicle, then each fuel type is sorted once. The visualization caps the tables at 12 trips.',
  examples: [
    { label: 'Two fuel types', input: sample },
    { label: 'One driver', input: oneFuel },
    { label: 'Single driver, one trip', input: '{"Drivers":[{"driver_id":1,"name":"Ada","accidents":0}],"Vehicles":[{"vehicle_id":10,"driver_id":1,"fuel_type":"Petrol"}],"Trips":[{"trip_id":1,"vehicle_id":10,"distance":5,"rating":5}]}' },
    { label: 'Equal scores for two drivers', input: '{"Drivers":[{"driver_id":1,"name":"Ada","accidents":1},{"driver_id":2,"name":"Bea","accidents":1}],"Vehicles":[{"vehicle_id":10,"driver_id":1,"fuel_type":"Petrol"},{"vehicle_id":11,"driver_id":2,"fuel_type":"Petrol"}],"Trips":[{"trip_id":1,"vehicle_id":10,"distance":8,"rating":4},{"trip_id":2,"vehicle_id":11,"distance":8,"rating":4}]}' },
    { label: 'Largest tables: 6 drivers, 8 vehicles, 12 trips', input: '{"Drivers":[{"driver_id":1,"name":"Driver 1","accidents":2},{"driver_id":2,"name":"Driver 2","accidents":0},{"driver_id":3,"name":"Driver 3","accidents":2},{"driver_id":4,"name":"Driver 4","accidents":5},{"driver_id":5,"name":"Driver 5","accidents":3},{"driver_id":6,"name":"Driver 6","accidents":4}],"Vehicles":[{"vehicle_id":100,"driver_id":1,"fuel_type":"Petrol"},{"vehicle_id":101,"driver_id":2,"fuel_type":"Diesel"},{"vehicle_id":102,"driver_id":3,"fuel_type":"Hybrid"},{"vehicle_id":103,"driver_id":4,"fuel_type":"Petrol"},{"vehicle_id":104,"driver_id":5,"fuel_type":"Diesel"},{"vehicle_id":105,"driver_id":6,"fuel_type":"Hybrid"},{"vehicle_id":106,"driver_id":1,"fuel_type":"Petrol"},{"vehicle_id":107,"driver_id":2,"fuel_type":"Diesel"}],"Trips":[{"trip_id":1,"vehicle_id":101,"distance":42,"rating":1},{"trip_id":2,"vehicle_id":101,"distance":17,"rating":1},{"trip_id":3,"vehicle_id":104,"distance":50,"rating":1},{"trip_id":4,"vehicle_id":103,"distance":29,"rating":2},{"trip_id":5,"vehicle_id":100,"distance":34,"rating":3},{"trip_id":6,"vehicle_id":103,"distance":40,"rating":4},{"trip_id":7,"vehicle_id":100,"distance":16,"rating":4},{"trip_id":8,"vehicle_id":104,"distance":25,"rating":4},{"trip_id":9,"vehicle_id":101,"distance":24,"rating":2},{"trip_id":10,"vehicle_id":103,"distance":28,"rating":2},{"trip_id":11,"vehicle_id":106,"distance":10,"rating":1},{"trip_id":12,"vehicle_id":106,"distance":29,"rating":5}]}' },
    { label: 'No trips', input: '{"Drivers":[{"driver_id":1,"name":"Ada","accidents":0}],"Vehicles":[{"vehicle_id":10,"driver_id":1,"fuel_type":"Petrol"}],"Trips":[]}' },
  ],
}

const columns = ['fuel_type', 'driver_id', 'rating', 'distance']

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{c === 'rating' ? Number(row[c]).toFixed(2) : String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function FindTopPerformingDriver() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption={step.phase === 'pick' || step.phase === 'output' ? 'Top driver per fuel type so far' : 'Average rating and distance per fuel type and driver'} columns={columns} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} fuel type row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Trips are joined to vehicles, then grouped by fuel type and driver. Within a fuel type the highest rounded rating wins, then the longer total distance, then the fewer accidents.</p>
  </>} />
}
