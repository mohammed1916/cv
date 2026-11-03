import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Users table (user_id, item, created_at, amount)'
const complexity = 'O(n squared) pair checks in this visualizer, which caps the table at 12 rows. A database would use a self-join on user_id.'
const examples = [{
  label: 'Sample',
  input: '{"Users":[{"user_id":1,"item":"pen","created_at":"2025-04-01","amount":10},{"user_id":1,"item":"ink","created_at":"2025-04-06","amount":4},{"user_id":2,"item":"pad","created_at":"2025-04-01","amount":7},{"user_id":2,"item":"pad","created_at":"2025-04-09","amount":3},{"user_id":3,"item":"cap","created_at":"2025-04-02","amount":9},{"user_id":3,"item":"cap","created_at":"2025-04-02","amount":2},{"user_id":4,"item":"box","created_at":"2025-04-03","amount":5},{"user_id":4,"item":"box","created_at":"2025-04-10","amount":5}]}',
}]
const reasoning = 'This teaching version pairs each user purchase with a later purchase on a different day. A gap of one to seven days counts, so user 1 (5 days) and user 4 (exactly 7 days) are active, user 2 (8 days) is not, and user 3 (same day) is not.'

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

export default function FindActiveUsers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
