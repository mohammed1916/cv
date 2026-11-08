import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Contacts (id, first_name, last_name) and Calls (contact_id, type incoming or outgoing, duration in seconds)'
const complexity = 'O(c log c) to sort the c calls, with the rank kept inside each call type. The visualization caps each table at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Contacts":[{"id":1,"first_name":"Ana","last_name":"Lee"},{"id":2,"first_name":"Ben","last_name":"Cruz"},{"id":3,"first_name":"Chen","last_name":"Wu"},{"id":4,"first_name":"Dara","last_name":"Kim"},{"id":5,"first_name":"Eli","last_name":"Ross"}],"Calls":[{"contact_id":1,"type":"outgoing","duration":3725},{"contact_id":2,"type":"incoming","duration":120},{"contact_id":3,"type":"outgoing","duration":3725},{"contact_id":4,"type":"incoming","duration":61},{"contact_id":2,"type":"outgoing","duration":900},{"contact_id":5,"type":"incoming","duration":45},{"contact_id":4,"type":"outgoing","duration":7200},{"contact_id":1,"type":"incoming","duration":600},{"contact_id":3,"type":"incoming","duration":30}]}',
  },
  { label: "One contact, one call", input: "{\"Contacts\":[{\"id\":1,\"first_name\":\"Ada\",\"last_name\":\"Park\"}],\"Calls\":[{\"contact_id\":1,\"type\":\"outgoing\",\"duration\":0}]}" },
  { label: "Equal durations", input: "{\"Contacts\":[{\"id\":1,\"first_name\":\"Ada\",\"last_name\":\"Park\"},{\"id\":2,\"first_name\":\"Bo\",\"last_name\":\"Ng\"}],\"Calls\":[{\"contact_id\":1,\"type\":\"incoming\",\"duration\":300},{\"contact_id\":2,\"type\":\"outgoing\",\"duration\":300}]}" },
  { label: "Longest allowed: 12 contacts and calls", input: "{\"Contacts\":[{\"id\":1,\"first_name\":\"F1\",\"last_name\":\"L1\"},{\"id\":2,\"first_name\":\"F2\",\"last_name\":\"L2\"},{\"id\":3,\"first_name\":\"F3\",\"last_name\":\"L3\"},{\"id\":4,\"first_name\":\"F4\",\"last_name\":\"L4\"},{\"id\":5,\"first_name\":\"F5\",\"last_name\":\"L5\"},{\"id\":6,\"first_name\":\"F6\",\"last_name\":\"L6\"},{\"id\":7,\"first_name\":\"F7\",\"last_name\":\"L7\"},{\"id\":8,\"first_name\":\"F8\",\"last_name\":\"L8\"},{\"id\":9,\"first_name\":\"F9\",\"last_name\":\"L9\"},{\"id\":10,\"first_name\":\"F10\",\"last_name\":\"L10\"},{\"id\":11,\"first_name\":\"F11\",\"last_name\":\"L11\"},{\"id\":12,\"first_name\":\"F12\",\"last_name\":\"L12\"}],\"Calls\":[{\"contact_id\":1,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":2,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":3,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":4,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":5,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":6,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":7,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":8,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":9,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":10,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":11,\"type\":\"outgoing\",\"duration\":86399},{\"contact_id\":12,\"type\":\"outgoing\",\"duration\":86399}]}" },
  { label: "Long run: 12 contacts and calls", input: "{\"Contacts\":[{\"id\":1,\"first_name\":\"F1\",\"last_name\":\"L1\"},{\"id\":2,\"first_name\":\"F2\",\"last_name\":\"L2\"},{\"id\":3,\"first_name\":\"F3\",\"last_name\":\"L3\"},{\"id\":4,\"first_name\":\"F4\",\"last_name\":\"L4\"},{\"id\":5,\"first_name\":\"F5\",\"last_name\":\"L5\"},{\"id\":6,\"first_name\":\"F6\",\"last_name\":\"L6\"},{\"id\":7,\"first_name\":\"F7\",\"last_name\":\"L7\"},{\"id\":8,\"first_name\":\"F8\",\"last_name\":\"L8\"},{\"id\":9,\"first_name\":\"F9\",\"last_name\":\"L9\"},{\"id\":10,\"first_name\":\"F10\",\"last_name\":\"L10\"},{\"id\":11,\"first_name\":\"F11\",\"last_name\":\"L11\"},{\"id\":12,\"first_name\":\"F12\",\"last_name\":\"L12\"}],\"Calls\":[{\"contact_id\":12,\"type\":\"outgoing\",\"duration\":141},{\"contact_id\":9,\"type\":\"incoming\",\"duration\":5370},{\"contact_id\":2,\"type\":\"outgoing\",\"duration\":3563},{\"contact_id\":11,\"type\":\"incoming\",\"duration\":5136},{\"contact_id\":12,\"type\":\"outgoing\",\"duration\":6521},{\"contact_id\":1,\"type\":\"incoming\",\"duration\":3926},{\"contact_id\":10,\"type\":\"outgoing\",\"duration\":5719},{\"contact_id\":11,\"type\":\"incoming\",\"duration\":2988},{\"contact_id\":8,\"type\":\"outgoing\",\"duration\":37},{\"contact_id\":9,\"type\":\"incoming\",\"duration\":82},{\"contact_id\":2,\"type\":\"outgoing\",\"duration\":3331},{\"contact_id\":11,\"type\":\"incoming\",\"duration\":5608}]}" },
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

export default function LongestCallsSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each call is joined to its contact's first name, then calls are ranked separately inside each type, longest first. Equal durations share a rank, and the next rank skips.</p>
    <p>Only ranks one to three survive. The duration is shown as HH:MM:SS, and the rows are sorted by type, duration and first name, all descending.</p>
  </>} />
}
