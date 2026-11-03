import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Emails (email_id, user_id, signup_date) and Texts (text_id, email_id, signup_action, action_date)'
const complexity = 'O(n + m) with a map from email to signup. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Emails":[{"email_id":1,"user_id":1,"signup_date":"2024-01-01"},{"email_id":2,"user_id":2,"signup_date":"2024-01-05"},{"email_id":3,"user_id":3,"signup_date":"2024-02-10"}],"Texts":[{"text_id":1,"email_id":1,"signup_action":"Verified","action_date":"2024-01-02"},{"text_id":2,"email_id":1,"signup_action":"Not Verified","action_date":"2024-01-02"},{"text_id":3,"email_id":2,"signup_action":"Verified","action_date":"2024-01-07"},{"text_id":4,"email_id":3,"signup_action":"Verified","action_date":"2024-02-11"},{"text_id":5,"email_id":3,"signup_action":"Verified","action_date":"2024-02-12"},{"text_id":6,"email_id":1,"signup_action":"Verified","action_date":"2024-01-02"}]}' },
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

export default function SecondDayVerification() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each text is attached to its signup. The gap is the number of calendar days between the two dates, so a Verified action on the next date qualifies.</p>
    <p>A user can verify more than once; the final step lists each qualifying user a single time.</p>
  </>} />
}
