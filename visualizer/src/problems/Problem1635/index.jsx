import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with Drivers, Rides and AcceptedRides lists"
const EXAMPLE = "{\"Drivers\":[{\"driver_id\":1,\"join_date\":\"2019-12-01\"},{\"driver_id\":2,\"join_date\":\"2020-02-15\"},{\"driver_id\":3,\"join_date\":\"2020-03-31\"}],\"Rides\":[{\"ride_id\":101,\"user_id\":7,\"requested_at\":\"2020-01-10\"},{\"ride_id\":102,\"user_id\":7,\"requested_at\":\"2020-02-14\"},{\"ride_id\":103,\"user_id\":8,\"requested_at\":\"2020-02-20\"},{\"ride_id\":104,\"user_id\":8,\"requested_at\":\"2020-03-02\"},{\"ride_id\":105,\"user_id\":9,\"requested_at\":\"2020-03-31\"},{\"ride_id\":106,\"user_id\":9,\"requested_at\":\"2019-12-30\"}],\"AcceptedRides\":[{\"ride_id\":101,\"driver_id\":1},{\"ride_id\":102,\"driver_id\":1},{\"ride_id\":103,\"driver_id\":2},{\"ride_id\":104,\"driver_id\":3},{\"ride_id\":106,\"driver_id\":1}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["A driver who joined in an earlier year is already active in January, so the comparison is on the join month.","Months are generated first, which is why a month with no accepted rides still appears with a zero."]

const definition = {
  number: '1635',
  title: "Hopper Company Queries I",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE }],
}

const formatValue = value => value === undefined || value === null ? '' : typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value)

function RowTable({ label, rows }) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))]
  return <section aria-label={label}>
    <h4>{label}</h4>
    {rows.length === 0 ? <p>No rows yet.</p> : <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}</tbody>
    </table>}
  </section>
}

export default function Problem1635() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
