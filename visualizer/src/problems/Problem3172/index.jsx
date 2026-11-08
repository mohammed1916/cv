import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Emails (email_id, user_id, signup_date) and Texts (text_id, email_id, signup_action, action_date)'
const complexity = 'O(n + m) with a map from email to signup. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Emails":[{"email_id":1,"user_id":1,"signup_date":"2024-01-01"},{"email_id":2,"user_id":2,"signup_date":"2024-01-05"},{"email_id":3,"user_id":3,"signup_date":"2024-02-10"}],"Texts":[{"text_id":1,"email_id":1,"signup_action":"Verified","action_date":"2024-01-02"},{"text_id":2,"email_id":1,"signup_action":"Not Verified","action_date":"2024-01-02"},{"text_id":3,"email_id":2,"signup_action":"Verified","action_date":"2024-01-07"},{"text_id":4,"email_id":3,"signup_action":"Verified","action_date":"2024-02-11"},{"text_id":5,"email_id":3,"signup_action":"Verified","action_date":"2024-02-12"},{"text_id":6,"email_id":1,"signup_action":"Verified","action_date":"2024-01-02"}]}' },
    { label: "Verified on the next day", input: "{\"Emails\": [{\"email_id\": 1, \"user_id\": 1, \"signup_date\": \"2024-03-01\"}], \"Texts\": [{\"text_id\": 1, \"email_id\": 1, \"signup_action\": \"Verified\", \"action_date\": \"2024-03-02\"}]}" },
    { label: "Same-day action", input: "{\"Emails\": [{\"email_id\": 1, \"user_id\": 1, \"signup_date\": \"2024-03-01\"}], \"Texts\": [{\"text_id\": 1, \"email_id\": 1, \"signup_action\": \"Verified\", \"action_date\": \"2024-03-01\"}]}" },
    { label: "Long run: 3 signups, 12 texts", input: "{\"Emails\": [{\"email_id\": 1, \"user_id\": 1, \"signup_date\": \"2024-01-10\"}, {\"email_id\": 2, \"user_id\": 2, \"signup_date\": \"2024-01-11\"}, {\"email_id\": 3, \"user_id\": 3, \"signup_date\": \"2024-02-01\"}], \"Texts\": [{\"text_id\": 1, \"email_id\": 1, \"signup_action\": \"Verified\", \"action_date\": \"2024-01-11\"}, {\"text_id\": 2, \"email_id\": 1, \"signup_action\": \"Not Verified\", \"action_date\": \"2024-01-12\"}, {\"text_id\": 3, \"email_id\": 2, \"signup_action\": \"Verified\", \"action_date\": \"2024-01-12\"}, {\"text_id\": 4, \"email_id\": 2, \"signup_action\": \"Verified\", \"action_date\": \"2024-01-13\"}, {\"text_id\": 5, \"email_id\": 3, \"signup_action\": \"Verified\", \"action_date\": \"2024-02-02\"}, {\"text_id\": 6, \"email_id\": 3, \"signup_action\": \"Verified\", \"action_date\": \"2024-02-05\"}, {\"text_id\": 7, \"email_id\": 1, \"signup_action\": \"Verified\", \"action_date\": \"2024-01-11\"}, {\"text_id\": 8, \"email_id\": 2, \"signup_action\": \"Not Verified\", \"action_date\": \"2024-01-14\"}, {\"text_id\": 9, \"email_id\": 3, \"signup_action\": \"Verified\", \"action_date\": \"2024-02-03\"}, {\"text_id\": 10, \"email_id\": 1, \"signup_action\": \"Verified\", \"action_date\": \"2024-01-20\"}, {\"text_id\": 11, \"email_id\": 2, \"signup_action\": \"Verified\", \"action_date\": \"2024-01-12\"}, {\"text_id\": 12, \"email_id\": 3, \"signup_action\": \"Not Verified\", \"action_date\": \"2024-02-04\"}]}" },
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
