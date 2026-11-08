import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Servers table (server_id, status_time in seconds, session_status start or stop)'
const complexity = 'O(e log e) to order the e events, plus a scan of the stops for each start. The visualization caps Servers at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Servers":[{"server_id":1,"status_time":0,"session_status":"start"},{"server_id":1,"status_time":50000,"session_status":"stop"},{"server_id":2,"status_time":1000,"session_status":"start"},{"server_id":2,"status_time":40000,"session_status":"stop"},{"server_id":1,"status_time":60000,"session_status":"start"},{"server_id":1,"status_time":90000,"session_status":"stop"},{"server_id":3,"status_time":100,"session_status":"start"}]}',
  },
  { label: "One start and stop", input: "{\"Servers\":[{\"server_id\":1,\"status_time\":0,\"session_status\":\"start\"},{\"server_id\":1,\"status_time\":10,\"session_status\":\"stop\"}]}" },
  { label: "Equal times on two servers", input: "{\"Servers\":[{\"server_id\":1,\"status_time\":5,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":5,\"session_status\":\"start\"}]}" },
  { label: "Largest times, 12 rows", input: "{\"Servers\":[{\"server_id\":1,\"status_time\":1000000,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":1000001,\"session_status\":\"stop\"},{\"server_id\":1,\"status_time\":1000002,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":1000003,\"session_status\":\"stop\"},{\"server_id\":1,\"status_time\":1000004,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":1000005,\"session_status\":\"stop\"},{\"server_id\":1,\"status_time\":1000006,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":1000007,\"session_status\":\"stop\"},{\"server_id\":1,\"status_time\":1000008,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":1000009,\"session_status\":\"stop\"},{\"server_id\":1,\"status_time\":1000010,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":1000011,\"session_status\":\"stop\"}]}" },
  { label: "Long run: 12 rows", input: "{\"Servers\":[{\"server_id\":1,\"status_time\":2078,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":5903,\"session_status\":\"stop\"},{\"server_id\":3,\"status_time\":6127,\"session_status\":\"start\"},{\"server_id\":1,\"status_time\":8482,\"session_status\":\"stop\"},{\"server_id\":2,\"status_time\":12068,\"session_status\":\"start\"},{\"server_id\":3,\"status_time\":15985,\"session_status\":\"stop\"},{\"server_id\":1,\"status_time\":20485,\"session_status\":\"start\"},{\"server_id\":2,\"status_time\":21884,\"session_status\":\"stop\"},{\"server_id\":3,\"status_time\":22074,\"session_status\":\"start\"},{\"server_id\":1,\"status_time\":22755,\"session_status\":\"stop\"},{\"server_id\":2,\"status_time\":27115,\"session_status\":\"start\"},{\"server_id\":3,\"status_time\":30502,\"session_status\":\"stop\"}]}" },
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

export default function ServerUptimeSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.rows.length > 0 && <IntervalView title="Closed sessions on each server" intervals={step.rows.map((row, index) => ({
      start: row.start_time, end: row.stop_time, group: `Server ${row.server_id}`,
      role: index === step.rows.length - 1 && step.phase === 'pair' ? 'current' : 'kept', label: `${row.stop_time - row.start_time}s`,
    }))} note="Each bar is one session from its start to the stop that closes it. Nested starts close last in, first out." />}
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output: ${run.result[0].total_uptime_days} whole days` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Walk each server's events in time order. A stop closes the most recent open start on that server, so nested sessions close inside out. A start with no later stop is left out of the total.</p>
    <p>The seconds of the matched sessions are added together across all servers, then integer division by 86400 gives whole days.</p>
  </>} />
}
