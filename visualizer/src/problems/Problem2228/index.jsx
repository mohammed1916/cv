import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import SqlStageView from './SqlStageView'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = "Object with a Purchases table"
const complexity = "Roughly O(n log n) to group and sort n purchase rows. The visualizer caps the table at 12 rows."
const examples = [{
  label: 'Sample',
  input: "{\"Purchases\":[{\"purchase_id\":1,\"user_id\":1,\"purchase_date\":\"2024-01-01\"},{\"purchase_id\":2,\"user_id\":1,\"purchase_date\":\"2024-01-05\"},{\"purchase_id\":3,\"user_id\":2,\"purchase_date\":\"2024-01-01\"},{\"purchase_id\":4,\"user_id\":2,\"purchase_date\":\"2024-01-09\"},{\"purchase_id\":5,\"user_id\":2,\"purchase_date\":\"2024-01-17\"},{\"purchase_id\":6,\"user_id\":3,\"purchase_date\":\"2024-02-01\"},{\"purchase_id\":7,\"user_id\":3,\"purchase_date\":\"2024-02-01\"}]}",
},
  { label: 'Single purchase', input: '{"Purchases":[{"purchase_id":1,"user_id":1,"purchase_date":"2024-01-01"}]}' },
  { label: 'Same user, same day', input: '{"Purchases":[{"purchase_id":1,"user_id":7,"purchase_date":"2024-03-09"},{"purchase_id":2,"user_id":7,"purchase_date":"2024-03-09"}]}' },
  { label: 'Long run: twelve purchases', input: '{"Purchases":[{"purchase_id":1,"user_id":2,"purchase_date":"2024-01-01"},{"purchase_id":2,"user_id":3,"purchase_date":"2024-02-08"},{"purchase_id":3,"user_id":6,"purchase_date":"2024-03-15"},{"purchase_id":4,"user_id":1,"purchase_date":"2024-01-22"},{"purchase_id":5,"user_id":2,"purchase_date":"2024-02-01"},{"purchase_id":6,"user_id":5,"purchase_date":"2024-03-08"},{"purchase_id":7,"user_id":6,"purchase_date":"2024-01-15"},{"purchase_id":8,"user_id":5,"purchase_date":"2024-02-22"},{"purchase_id":9,"user_id":4,"purchase_date":"2024-03-01"},{"purchase_id":10,"user_id":1,"purchase_date":"2024-01-08"},{"purchase_id":11,"user_id":4,"purchase_date":"2024-02-15"},{"purchase_id":12,"user_id":3,"purchase_date":"2024-03-22"}]}' },
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

export default function SqlWalkthrough() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageView phases={phases} step={step} columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Two purchases of one user count when their dates differ by at most seven days, and the same day counts as zero days apart. Each user is checked against the closest pair of dates.</p>} />
}
