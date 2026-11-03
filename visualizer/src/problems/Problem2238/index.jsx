import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = "Object with a Rides table"
const complexity = "Roughly O(d * n) for d distinct drivers and n ride rows in this teaching walkthrough. The visualizer caps the table at 12 rows."
const examples = [{
  label: 'Sample',
  input: "{\"Rides\":[{\"ride_id\":1,\"driver_id\":10,\"passenger_id\":20},{\"ride_id\":2,\"driver_id\":10,\"passenger_id\":30},{\"ride_id\":3,\"driver_id\":20,\"passenger_id\":10},{\"ride_id\":4,\"driver_id\":30,\"passenger_id\":20},{\"ride_id\":5,\"driver_id\":40,\"passenger_id\":10}]}",
}]

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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Collect every driver first. Then count each driver's rides as a passenger with a left join, so a driver who never rode along stays in the output with zero.</p>} />
}
