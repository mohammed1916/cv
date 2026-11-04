import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Users table (user_id, item, created_at, amount)'
const complexity = 'O(n squared) pair checks in this visualizer, which caps the table at 12 rows. A database would use a self-join on user_id with a date range filter.'
const examples = [{
  label: 'Sample',
  input: '{"Users":[{"user_id":1,"item":"pen","created_at":"2025-04-01","amount":10},{"user_id":1,"item":"ink","created_at":"2025-04-06","amount":4},{"user_id":2,"item":"pad","created_at":"2025-04-01","amount":7},{"user_id":2,"item":"pad","created_at":"2025-04-09","amount":3},{"user_id":3,"item":"cap","created_at":"2025-04-02","amount":9},{"user_id":3,"item":"cap","created_at":"2025-04-02","amount":2},{"user_id":4,"item":"box","created_at":"2025-04-03","amount":5},{"user_id":4,"item":"box","created_at":"2025-04-10","amount":5}]}',
}]
const reasoning = 'Every pair of purchases by the same user is compared. A later purchase within seven days of an earlier one makes the user active, so user 1 (5 days) and user 4 (exactly 7 days) are active, user 2 (8 days) is not, and user 3 (two purchases on the same day) is active because a repeat on the same day is within seven days.'

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

// One chip per SQL stage, in the order the query runs, with the current stage filled.
function StageStrip({ phases = [], current }) {
  const at = Math.max(0, phases.findIndex(p => p.id === current))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((p, i) => <li key={p.id} aria-current={p.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
      border: p.id === current ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i <= at ? 'var(--primary-glow)' : 'var(--surface)', opacity: i <= at ? 1 : 0.6,
    }}>{p.label}</li>)}
  </ol>
}

export default function FindActiveUsers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
