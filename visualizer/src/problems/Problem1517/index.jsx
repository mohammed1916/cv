import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Users', description: 'Read every user and mail.' },
  { id: 'check', label: 'Check', description: 'Test one mail against the pattern and report why it fails.' },
  { id: 'done', label: 'Result', description: 'Return the users whose mail is valid.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  number: '1517', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Users list of { user_id, name, mail } rows',
  url: 'https://leetcode.com/problems/find-users-with-valid-e-mails/',
  complexity: 'O(u * m) for u users and mails of length m.',
  examples: [
    { label: 'Example', input: '{"Users":[{"user_id":1,"name":"Winston","mail":"winston@leetcode.com"},{"user_id":2,"name":"Jonathan","mail":"jonathan.leetcode@leetcode.com"},{"user_id":3,"name":"Annabelle","mail":"1annabelle@leetcode.com"},{"user_id":4,"name":"Sally","mail":"sally.2020@gmail.com"},{"user_id":5,"name":"Marco","mail":"marco-x_9@leetcode.com"},{"user_id":6,"name":"Bad","mail":"bad@leetcode.co"},{"user_id":7,"name":"Upper","mail":"Upper@LeetCode.com"}]}' },
  ],
}

export default function ValidEmails() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>The prefix must begin with a letter and use only letters, digits, underscore, period or hyphen. The domain must match exactly, so the teaching rule treats leetcode.com in other capitalisations as invalid.</p>
  </>} />
}
