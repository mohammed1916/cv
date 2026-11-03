import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a ParkingTransactions table (times in minutes from midnight)'
const complexity = 'O(n log n) for the per-car sort of lots. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"ParkingTransactions":[{"transaction_id":1,"car_id":1,"lot_id":1,"entry_time":0,"exit_time":60,"fee_paid":5},{"transaction_id":2,"car_id":1,"lot_id":2,"entry_time":100,"exit_time":130,"fee_paid":2.5},{"transaction_id":3,"car_id":1,"lot_id":1,"entry_time":200,"exit_time":230,"fee_paid":2},{"transaction_id":4,"car_id":2,"lot_id":3,"entry_time":0,"exit_time":40,"fee_paid":4},{"transaction_id":5,"car_id":2,"lot_id":2,"entry_time":50,"exit_time":60,"fee_paid":1}]}' },
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
