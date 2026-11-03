import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function Grid({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={cell}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'JSON object with a users list (user_id, email)',
  url: 'https://leetcode.com/problems/find-valid-emails/description/',
  complexity: 'O(n) time for n users, each email checked once. The pattern is a knowledge-derived teaching rule, not the official one.',
  examples: [
    { label: 'Example', input: '{"users":[{"user_id":1,"email":"ann@example.com"},{"user_id":2,"email":"1bob@example.com"},{"user_id":3,"email":"carl_9@example.com"},{"user_id":4,"email":"dee@example.org"}]}' },
    { label: 'Empty', input: '{"users":[]}' },
  ],
}

export default function Problem3436() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {Object.entries(run.input).map(([name, rows]) => <section key={name}><h3>{name} (input)</h3><Grid rows={rows} /></section>)}
    <section><h3>Current rows</h3><Grid rows={step.rows} /></section>
    <output aria-label="Result rows">{`Result: ${run.result.length} row${run.result.length === 1 ? '' : 's'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each email is judged on its own. The local part must begin with a letter, and only letters, digits, underscores, dots and hyphens may follow.</p>
    <p>The domain test is exact, so another domain or different capitalization fails.</p>
  </>} />
}
