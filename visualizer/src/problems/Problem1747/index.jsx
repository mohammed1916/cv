import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of LogInfo rows'
const complexity = 'Compares every pair of sessions of the same account, so the cost grows with the square of sessions per account. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"account_id":1,"ip_address":10,"login":1,"logout":5},{"account_id":1,"ip_address":20,"login":5,"logout":9},{"account_id":2,"ip_address":10,"login":1,"logout":4},{"account_id":2,"ip_address":20,"login":5,"logout":9},{"account_id":3,"ip_address":10,"login":2,"logout":8},{"account_id":3,"ip_address":10,"login":3,"logout":6},{"account_id":4,"ip_address":30,"login":1,"logout":10},{"account_id":4,"ip_address":40,"login":4,"logout":5},{"account_id":5,"ip_address":50,"login":1,"logout":2}]',
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
  </>} renderReasoning={() => <p>Each pair of sessions on different IP addresses is checked with the two overlap comparisons. Touching endpoints count, so a logout at minute 5 and a login at minute 5 flag the account.</p>} />
}
