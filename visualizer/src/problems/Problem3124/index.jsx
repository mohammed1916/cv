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
