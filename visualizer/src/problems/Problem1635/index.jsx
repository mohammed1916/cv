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
  examples: [{ label: 'Sample', input: EXAMPLE }, { label: 'Single driver and ride', input: '{"Drivers":[{"driver_id":1,"join_date":"2020-01-05"}],"Rides":[{"ride_id":1,"user_id":5,"requested_at":"2020-01-07"}],"AcceptedRides":[{"ride_id":1,"driver_id":1}]}' }, { label: 'Equal join months', input: '{"Drivers":[{"driver_id":1,"join_date":"2020-02-01"},{"driver_id":2,"join_date":"2020-02-29"}],"Rides":[{"ride_id":1,"user_id":5,"requested_at":"2020-02-03"},{"ride_id":2,"user_id":6,"requested_at":"2020-02-03"}],"AcceptedRides":[{"ride_id":1,"driver_id":1}]}' }, { label: 'Year boundary dates', input: '{"Drivers":[{"driver_id":1,"join_date":"2019-12-31"},{"driver_id":2,"join_date":"2020-01-01"},{"driver_id":3,"join_date":"2020-12-31"},{"driver_id":4,"join_date":"2021-01-01"},{"driver_id":5,"join_date":"2019-12-31"},{"driver_id":6,"join_date":"2020-01-01"},{"driver_id":7,"join_date":"2020-12-31"},{"driver_id":8,"join_date":"2021-01-01"}],"Rides":[{"ride_id":201,"user_id":1,"requested_at":"2020-01-01"},{"ride_id":202,"user_id":2,"requested_at":"2020-12-31"},{"ride_id":203,"user_id":3,"requested_at":"2021-01-01"},{"ride_id":204,"user_id":1,"requested_at":"2019-12-31"},{"ride_id":205,"user_id":2,"requested_at":"2020-01-01"},{"ride_id":206,"user_id":3,"requested_at":"2020-12-31"},{"ride_id":207,"user_id":1,"requested_at":"2021-01-01"},{"ride_id":208,"user_id":2,"requested_at":"2019-12-31"},{"ride_id":209,"user_id":3,"requested_at":"2020-01-01"},{"ride_id":210,"user_id":1,"requested_at":"2020-12-31"},{"ride_id":211,"user_id":2,"requested_at":"2021-01-01"},{"ride_id":212,"user_id":3,"requested_at":"2019-12-31"}],"AcceptedRides":[{"ride_id":201,"driver_id":1},{"ride_id":202,"driver_id":2},{"ride_id":203,"driver_id":3},{"ride_id":204,"driver_id":4},{"ride_id":205,"driver_id":5},{"ride_id":206,"driver_id":6},{"ride_id":207,"driver_id":7},{"ride_id":208,"driver_id":8},{"ride_id":209,"driver_id":1},{"ride_id":210,"driver_id":2},{"ride_id":211,"driver_id":3},{"ride_id":212,"driver_id":4}]}' }, { label: 'No accepted rides', input: '{"Drivers":[{"driver_id":1,"join_date":"2020-05-01"}],"Rides":[{"ride_id":1,"user_id":2,"requested_at":"2020-05-03"}],"AcceptedRides":[]}' }, { label: 'Long run: 12 rides', input: '{"Drivers":[{"driver_id":1,"join_date":"2021-07-25"},{"driver_id":2,"join_date":"2020-08-09"},{"driver_id":3,"join_date":"2019-08-27"},{"driver_id":4,"join_date":"2021-04-25"},{"driver_id":5,"join_date":"2021-05-03"},{"driver_id":6,"join_date":"2021-03-22"},{"driver_id":7,"join_date":"2020-01-27"},{"driver_id":8,"join_date":"2021-09-07"}],"Rides":[{"ride_id":101,"user_id":9,"requested_at":"2021-12-05"},{"ride_id":102,"user_id":5,"requested_at":"2019-05-12"},{"ride_id":103,"user_id":3,"requested_at":"2021-06-15"},{"ride_id":104,"user_id":3,"requested_at":"2021-05-06"},{"ride_id":105,"user_id":8,"requested_at":"2020-05-17"},{"ride_id":106,"user_id":3,"requested_at":"2021-02-05"},{"ride_id":107,"user_id":6,"requested_at":"2019-08-25"},{"ride_id":108,"user_id":9,"requested_at":"2020-04-25"},{"ride_id":109,"user_id":3,"requested_at":"2020-01-02"},{"ride_id":110,"user_id":7,"requested_at":"2020-11-10"},{"ride_id":111,"user_id":4,"requested_at":"2021-03-19"},{"ride_id":112,"user_id":8,"requested_at":"2020-03-12"}],"AcceptedRides":[{"ride_id":101,"driver_id":2},{"ride_id":102,"driver_id":8},{"ride_id":103,"driver_id":5},{"ride_id":104,"driver_id":2},{"ride_id":105,"driver_id":4},{"ride_id":106,"driver_id":3},{"ride_id":107,"driver_id":4},{"ride_id":108,"driver_id":7},{"ride_id":109,"driver_id":6},{"ride_id":110,"driver_id":4},{"ride_id":111,"driver_id":5},{"ride_id":112,"driver_id":5}]}' }],
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function MonthChart({ rows }) {
  if (rows.length === 0 || !('active_drivers' in rows[0] || 'accepted_rides' in rows[0])) return null
  const max = Math.max(1, ...rows.map(r => Math.max(r.active_drivers ?? 0, r.accepted_rides ?? 0)))
  const bar = (value, colour) => <div style={{ height: 90 * ((value ?? 0) / max), minHeight: value ? 2 : 0, width: 9, background: colour, borderRadius: '3px 3px 0 0' }} />
  return <section aria-label="Monthly statistics for 2020">
    <h4>2020 by month</h4>
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, borderBottom: '1px solid var(--border)' }}>
      {rows.map(r => <div key={r.month} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 90 }}>
          {r.active_drivers !== undefined && bar(r.active_drivers, 'var(--primary)')}
          {r.accepted_rides !== undefined && bar(r.accepted_rides, 'var(--success)')}
        </div>
        <small style={{ color: 'var(--text-muted)' }}>{MONTHS[r.month - 1]}</small>
      </div>)}
    </div>
    <p style={{ color: 'var(--text-muted)' }}>Purple: active drivers by month end. Green: accepted rides requested that month.</p>
  </section>
}

export default function Problem1635() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <MonthChart rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
