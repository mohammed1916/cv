import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Calls table (caller_id, recipient_id, call_time)'
const complexity = 'O(c log c) time for c call legs, from sorting by user and time. The visualizer caps Calls at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Calls":[{"caller_id":1,"recipient_id":2,"call_time":"2020-08-21 09:00:00"},{"caller_id":2,"recipient_id":1,"call_time":"2020-08-21 12:30:00"},{"caller_id":1,"recipient_id":3,"call_time":"2020-08-21 15:00:00"},{"caller_id":4,"recipient_id":5,"call_time":"2020-08-22 10:00:00"},{"caller_id":5,"recipient_id":6,"call_time":"2020-08-22 11:00:00"},{"caller_id":4,"recipient_id":6,"call_time":"2020-08-22 18:00:00"},{"caller_id":7,"recipient_id":8,"call_time":"2020-08-23 08:00:00"},{"caller_id":8,"recipient_id":7,"call_time":"2020-08-23 20:00:00"},{"caller_id":7,"recipient_id":8,"call_time":"2020-08-24 09:00:00"}]}' },
  { label: 'Two-person day', input: '{"Calls":[{"caller_id":1,"recipient_id":2,"call_time":"2021-01-05 09:00:00"},{"caller_id":2,"recipient_id":3,"call_time":"2021-01-05 10:00:00"},{"caller_id":1,"recipient_id":2,"call_time":"2021-01-05 11:00:00"}]}' },
  { label: "Single call", input: "{\"Calls\":[{\"caller_id\":3,\"recipient_id\":4,\"call_time\":\"2021-02-14 10:00:00\"}]}" },
  { label: "Equal call times on one day", input: "{\"Calls\":[{\"caller_id\":1,\"recipient_id\":2,\"call_time\":\"2021-03-01 12:00:00\"},{\"caller_id\":2,\"recipient_id\":1,\"call_time\":\"2021-03-01 12:00:00\"},{\"caller_id\":3,\"recipient_id\":1,\"call_time\":\"2021-03-01 12:00:00\"}]}" },
  { label: "Only self calls", input: "{\"Calls\":[{\"caller_id\":5,\"recipient_id\":5,\"call_time\":\"2021-04-02 08:00:00\"},{\"caller_id\":6,\"recipient_id\":6,\"call_time\":\"2021-04-02 09:00:00\"}]}" },
  { label: "Long run: 12 calls over three days", input: "{\"Calls\":[{\"caller_id\":1,\"recipient_id\":3,\"call_time\":\"2021-05-01 08:00:00\"},{\"caller_id\":6,\"recipient_id\":1,\"call_time\":\"2021-05-02 09:00:00\"},{\"caller_id\":4,\"recipient_id\":5,\"call_time\":\"2021-05-03 10:00:00\"},{\"caller_id\":4,\"recipient_id\":3,\"call_time\":\"2021-05-01 11:00:00\"},{\"caller_id\":6,\"recipient_id\":3,\"call_time\":\"2021-05-02 12:00:00\"},{\"caller_id\":1,\"recipient_id\":6,\"call_time\":\"2021-05-03 13:00:00\"},{\"caller_id\":1,\"recipient_id\":2,\"call_time\":\"2021-05-01 14:00:00\"},{\"caller_id\":5,\"recipient_id\":4,\"call_time\":\"2021-05-02 15:00:00\"},{\"caller_id\":4,\"recipient_id\":1,\"call_time\":\"2021-05-03 16:00:00\"},{\"caller_id\":4,\"recipient_id\":5,\"call_time\":\"2021-05-01 17:00:00\"},{\"caller_id\":3,\"recipient_id\":6,\"call_time\":\"2021-05-02 18:00:00\"},{\"caller_id\":5,\"recipient_id\":4,\"call_time\":\"2021-05-03 19:00:00\"}]}" },
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

export default function FirstLastCallSameDay() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each call is copied so both people see it. Within one person and one day, ordering by time gives the first and last counterpart.</p>
    <p>The walkthrough data has no two calls at the same timestamp, so the order is fully determined. A user with one call that day has the same first and last counterpart.</p>
  </>} />
}
