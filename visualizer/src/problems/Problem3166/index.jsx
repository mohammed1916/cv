import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a ParkingTransactions table (times in minutes from midnight)'
const complexity = 'O(n log n) for the per-car sort of lots. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"ParkingTransactions":[{"transaction_id":1,"car_id":1,"lot_id":1,"entry_time":0,"exit_time":60,"fee_paid":5},{"transaction_id":2,"car_id":1,"lot_id":2,"entry_time":100,"exit_time":130,"fee_paid":2.5},{"transaction_id":3,"car_id":1,"lot_id":1,"entry_time":200,"exit_time":230,"fee_paid":2},{"transaction_id":4,"car_id":2,"lot_id":3,"entry_time":0,"exit_time":40,"fee_paid":4},{"transaction_id":5,"car_id":2,"lot_id":2,"entry_time":50,"exit_time":60,"fee_paid":1}]}' },
    { label: "Single stay", input: "{\"ParkingTransactions\": [{\"transaction_id\": 1, \"car_id\": 7, \"lot_id\": 3, \"entry_time\": 600, \"exit_time\": 601, \"fee_paid\": 0}]}" },
    { label: "Whole day, largest exit", input: "{\"ParkingTransactions\": [{\"transaction_id\": 1, \"car_id\": 1, \"lot_id\": 1, \"entry_time\": 0, \"exit_time\": 1440, \"fee_paid\": 12}]}" },
    { label: "Equal minutes in two lots", input: "{\"ParkingTransactions\": [{\"transaction_id\": 1, \"car_id\": 1, \"lot_id\": 2, \"entry_time\": 0, \"exit_time\": 60, \"fee_paid\": 3}, {\"transaction_id\": 2, \"car_id\": 1, \"lot_id\": 1, \"entry_time\": 100, \"exit_time\": 160, \"fee_paid\": 3}]}" },
    { label: "Long run: 12 stays, three cars", input: "{\"ParkingTransactions\": [{\"transaction_id\": 1, \"car_id\": 1, \"lot_id\": 1, \"entry_time\": 0, \"exit_time\": 45, \"fee_paid\": 2}, {\"transaction_id\": 2, \"car_id\": 1, \"lot_id\": 2, \"entry_time\": 60, \"exit_time\": 90, \"fee_paid\": 1.5}, {\"transaction_id\": 3, \"car_id\": 1, \"lot_id\": 3, \"entry_time\": 120, \"exit_time\": 300, \"fee_paid\": 6}, {\"transaction_id\": 4, \"car_id\": 2, \"lot_id\": 1, \"entry_time\": 10, \"exit_time\": 20, \"fee_paid\": 0.5}, {\"transaction_id\": 5, \"car_id\": 2, \"lot_id\": 2, \"entry_time\": 30, \"exit_time\": 75, \"fee_paid\": 2}, {\"transaction_id\": 6, \"car_id\": 2, \"lot_id\": 2, \"entry_time\": 200, \"exit_time\": 210, \"fee_paid\": 1}, {\"transaction_id\": 7, \"car_id\": 3, \"lot_id\": 3, \"entry_time\": 400, \"exit_time\": 460, \"fee_paid\": 4}, {\"transaction_id\": 8, \"car_id\": 3, \"lot_id\": 1, \"entry_time\": 500, \"exit_time\": 505, \"fee_paid\": 0.25}, {\"transaction_id\": 9, \"car_id\": 3, \"lot_id\": 3, \"entry_time\": 600, \"exit_time\": 700, \"fee_paid\": 5}, {\"transaction_id\": 10, \"car_id\": 1, \"lot_id\": 2, \"entry_time\": 800, \"exit_time\": 830, \"fee_paid\": 1.5}, {\"transaction_id\": 11, \"car_id\": 2, \"lot_id\": 3, \"entry_time\": 900, \"exit_time\": 960, \"fee_paid\": 3}, {\"transaction_id\": 12, \"car_id\": 3, \"lot_id\": 2, \"entry_time\": 1000, \"exit_time\": 1440, \"fee_paid\": 9}]}" },
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

export default function ParkingFeesAndDuration() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each stay gives its minutes. Summing minutes per car and per lot gives the time spent in each place.</p>
    <p>The hourly rate is total fee times 60 divided by total minutes, rounded to two decimals. The lot with the most minutes wins, and a tie goes to the smaller lot id.</p>
  </>} />
}
