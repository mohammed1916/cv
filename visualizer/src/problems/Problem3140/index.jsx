import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Cinema table (seat_id, free as 0 or 1)'
const complexity = 'O(n log n) for the sort, then one pass over the seats. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Cinema":[{"seat_id":1,"free":1},{"seat_id":2,"free":1},{"seat_id":3,"free":0},{"seat_id":4,"free":1},{"seat_id":5,"free":1},{"seat_id":6,"free":1},{"seat_id":7,"free":0},{"seat_id":8,"free":1}]}' },
  { label: 'Tie', input: '{"Cinema":[{"seat_id":1,"free":1},{"seat_id":2,"free":1},{"seat_id":3,"free":0},{"seat_id":4,"free":1},{"seat_id":5,"free":1}]}' },
    { label: "Single free seat", input: "{\"Cinema\": [{\"seat_id\": 1, \"free\": 1}]}" },
    { label: "No free seats", input: "{\"Cinema\": [{\"seat_id\": 1, \"free\": 0}, {\"seat_id\": 2, \"free\": 0}]}" },
    { label: "Long run: 12 seats, three gaps", input: "{\"Cinema\": [{\"seat_id\": 1, \"free\": 1}, {\"seat_id\": 2, \"free\": 1}, {\"seat_id\": 3, \"free\": 0}, {\"seat_id\": 4, \"free\": 1}, {\"seat_id\": 5, \"free\": 1}, {\"seat_id\": 6, \"free\": 1}, {\"seat_id\": 7, \"free\": 1}, {\"seat_id\": 8, \"free\": 0}, {\"seat_id\": 9, \"free\": 1}, {\"seat_id\": 10, \"free\": 1}, {\"seat_id\": 11, \"free\": 1}, {\"seat_id\": 12, \"free\": 0}]}" },
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

export default function ConsecutiveAvailableSeats() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const freeBy = new Map(run.input.Cinema.map(row => [row.seat_id, row.free]))
    const seats = Math.max(...run.input.Cinema.map(row => row.seat_id))
    const keptSeats = new Set(step.phase === 'done' || step.phase === 'pick' ? step.rows.filter(row => row.kept === 'yes').map(row => row.seat_id) : [])
    return <>
    <IndexedSequence label="Seat row (seat ids from 1)" length={seats} indexOffset={1}
      valueAt={i => (freeBy.get(i + 1) === 1 ? 'free' : 'taken')} active={-1}
      roleAt={i => (keptSeats.has(i + 1) ? 'kept' : '')} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>}} renderReasoning={() => <>
    <p>Free seats that touch each other share one block. Subtracting the row number from the seat id gives the same value for every seat in a block.</p>
    <p>Grouping by that value gives each block's length. The query keeps the longest block or blocks and reports the first seat, last seat and length of each one.</p>
  </>} />
}
