import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import BusStationView from './BusStationView'

const inputLabel = 'Object with Buses and Passengers tables'
const complexity = 'O(b * p) with the simple join used here; the visualizer caps each table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Buses":[{"bus_id":1,"arrival_time":2},{"bus_id":2,"arrival_time":4},{"bus_id":3,"arrival_time":7}],"Passengers":[{"passenger_id":11,"arrival_time":1},{"passenger_id":12,"arrival_time":2},{"passenger_id":13,"arrival_time":3},{"passenger_id":14,"arrival_time":4},{"passenger_id":15,"arrival_time":8}]}',
},
  { label: 'One bus, one passenger', input: '{"Buses":[{"bus_id":1,"arrival_time":5}],"Passengers":[{"passenger_id":7,"arrival_time":5}]}' },
  { label: 'Equal arrival times', input: '{"Buses":[{"bus_id":1,"arrival_time":3},{"bus_id":2,"arrival_time":6}],"Passengers":[{"passenger_id":1,"arrival_time":3},{"passenger_id":2,"arrival_time":3},{"passenger_id":3,"arrival_time":6}]}' },
  { label: 'Passenger after the last bus', input: '{"Buses":[{"bus_id":1,"arrival_time":2}],"Passengers":[{"passenger_id":4,"arrival_time":9}]}' },
  { label: 'Long run: 12 buses and passengers', input: '{"Buses":[{"bus_id":1,"arrival_time":7},{"bus_id":2,"arrival_time":35},{"bus_id":3,"arrival_time":54},{"bus_id":4,"arrival_time":25},{"bus_id":5,"arrival_time":60},{"bus_id":6,"arrival_time":57},{"bus_id":7,"arrival_time":22},{"bus_id":8,"arrival_time":9},{"bus_id":9,"arrival_time":56},{"bus_id":10,"arrival_time":59},{"bus_id":11,"arrival_time":28},{"bus_id":12,"arrival_time":38}],"Passengers":[{"passenger_id":101,"arrival_time":20},{"passenger_id":102,"arrival_time":55},{"passenger_id":103,"arrival_time":46},{"passenger_id":104,"arrival_time":2},{"passenger_id":105,"arrival_time":6},{"passenger_id":106,"arrival_time":15},{"passenger_id":107,"arrival_time":58},{"passenger_id":108,"arrival_time":31},{"passenger_id":109,"arrival_time":22},{"passenger_id":110,"arrival_time":29},{"passenger_id":111,"arrival_time":15},{"passenger_id":112,"arrival_time":18}]}' },
]
const reasoning = 'Every passenger is matched to the earliest bus that leaves at or after their arrival. Unlimited capacity means no bus ever turns anyone away, so each passenger is counted once.'

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

export default function SqlWalkthrough() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BusStationView run={run} step={step} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
