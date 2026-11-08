import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with users and register lists"
const EXAMPLE = "{\"users\":[{\"user_id\":1,\"user_name\":\"Ruth\"},{\"user_id\":2,\"user_name\":\"Sam\"},{\"user_id\":3,\"user_name\":\"Theo\"},{\"user_id\":4,\"user_name\":\"Uma\"}],\"register\":[{\"contest_id\":415,\"user_id\":1},{\"contest_id\":415,\"user_id\":2},{\"contest_id\":415,\"user_id\":3},{\"contest_id\":409,\"user_id\":2},{\"contest_id\":409,\"user_id\":3},{\"contest_id\":411,\"user_id\":1},{\"contest_id\":411,\"user_id\":4},{\"contest_id\":408,\"user_id\":1},{\"contest_id\":408,\"user_id\":2},{\"contest_id\":408,\"user_id\":3},{\"contest_id\":408,\"user_id\":4}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["The denominator is the whole user table, not just the people who registered for a given contest.","Sorting uses the computed percentage first and the contest id second, so equal percentages stay in a stable order."]

const definition = {
  number: '1633',
  title: "Percentage of Users Attended a Contest",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE },
    { label: "Single user, no registrations", input: "{\"users\":[{\"user_id\":1,\"user_name\":\"Ada\"}],\"register\":[]}" },
    { label: "Equal percentages", input: "{\"users\":[{\"user_id\":1,\"user_name\":\"Ada\"},{\"user_id\":2,\"user_name\":\"Bo\"}],\"register\":[{\"contest_id\":101,\"user_id\":1},{\"contest_id\":101,\"user_id\":2}]}" },
    { label: "Ten users, thirty registrations", input: "{\"users\":[{\"user_id\":1,\"user_name\":\"U1\"},{\"user_id\":2,\"user_name\":\"U2\"},{\"user_id\":3,\"user_name\":\"U3\"},{\"user_id\":4,\"user_name\":\"U4\"},{\"user_id\":5,\"user_name\":\"U5\"},{\"user_id\":6,\"user_name\":\"U6\"},{\"user_id\":7,\"user_name\":\"U7\"},{\"user_id\":8,\"user_name\":\"U8\"},{\"user_id\":9,\"user_name\":\"U9\"},{\"user_id\":10,\"user_name\":\"U10\"}],\"register\":[{\"contest_id\":101,\"user_id\":1},{\"contest_id\":102,\"user_id\":2},{\"contest_id\":103,\"user_id\":3},{\"contest_id\":104,\"user_id\":4},{\"contest_id\":105,\"user_id\":5},{\"contest_id\":106,\"user_id\":6},{\"contest_id\":101,\"user_id\":7},{\"contest_id\":102,\"user_id\":8},{\"contest_id\":103,\"user_id\":9},{\"contest_id\":104,\"user_id\":10},{\"contest_id\":105,\"user_id\":1},{\"contest_id\":106,\"user_id\":2},{\"contest_id\":101,\"user_id\":3},{\"contest_id\":102,\"user_id\":4},{\"contest_id\":103,\"user_id\":5},{\"contest_id\":104,\"user_id\":6},{\"contest_id\":105,\"user_id\":7},{\"contest_id\":106,\"user_id\":8},{\"contest_id\":101,\"user_id\":9},{\"contest_id\":102,\"user_id\":10},{\"contest_id\":103,\"user_id\":1},{\"contest_id\":104,\"user_id\":2},{\"contest_id\":105,\"user_id\":3},{\"contest_id\":106,\"user_id\":4},{\"contest_id\":101,\"user_id\":5},{\"contest_id\":102,\"user_id\":6},{\"contest_id\":103,\"user_id\":7},{\"contest_id\":104,\"user_id\":8},{\"contest_id\":105,\"user_id\":9},{\"contest_id\":106,\"user_id\":10}]}" },
    { label: "Long run: ten users, thirty registrations", input: "{\"users\":[{\"user_id\":1,\"user_name\":\"U1\"},{\"user_id\":2,\"user_name\":\"U2\"},{\"user_id\":3,\"user_name\":\"U3\"},{\"user_id\":4,\"user_name\":\"U4\"},{\"user_id\":5,\"user_name\":\"U5\"},{\"user_id\":6,\"user_name\":\"U6\"},{\"user_id\":7,\"user_name\":\"U7\"},{\"user_id\":8,\"user_name\":\"U8\"},{\"user_id\":9,\"user_name\":\"U9\"},{\"user_id\":10,\"user_name\":\"U10\"}],\"register\":[{\"contest_id\":104,\"user_id\":10},{\"contest_id\":103,\"user_id\":7},{\"contest_id\":103,\"user_id\":9},{\"contest_id\":102,\"user_id\":6},{\"contest_id\":105,\"user_id\":5},{\"contest_id\":106,\"user_id\":4},{\"contest_id\":101,\"user_id\":4},{\"contest_id\":102,\"user_id\":1},{\"contest_id\":106,\"user_id\":2},{\"contest_id\":103,\"user_id\":2},{\"contest_id\":103,\"user_id\":1},{\"contest_id\":105,\"user_id\":2},{\"contest_id\":102,\"user_id\":4},{\"contest_id\":104,\"user_id\":9},{\"contest_id\":103,\"user_id\":5},{\"contest_id\":104,\"user_id\":4},{\"contest_id\":101,\"user_id\":1},{\"contest_id\":101,\"user_id\":4},{\"contest_id\":104,\"user_id\":9},{\"contest_id\":101,\"user_id\":3},{\"contest_id\":105,\"user_id\":2},{\"contest_id\":103,\"user_id\":6},{\"contest_id\":101,\"user_id\":10},{\"contest_id\":102,\"user_id\":5},{\"contest_id\":101,\"user_id\":9},{\"contest_id\":101,\"user_id\":9},{\"contest_id\":103,\"user_id\":1},{\"contest_id\":106,\"user_id\":6},{\"contest_id\":105,\"user_id\":4},{\"contest_id\":105,\"user_id\":3}]}" }],
}

const formatValue = value => value === undefined || value === null ? '' : typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value)

function RowTable({ label, rows }) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))]
  return <section aria-label={label}>
    <h4>{label}</h4>
    {rows.length === 0 ? <p>No rows yet.</p> : <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}</tbody>
    </table>}
  </section>
}

function PercentBars({ rows }) {
  if (rows.length === 0 || !('percentage' in rows[0])) return null
  const max = 100
  return <section aria-label="Attendance percentages">
    <h4>Attendance per contest, out of all users</h4>
    {rows.map(row => <div key={row.contest_id} style={{ display: 'grid', gridTemplateColumns: '5rem 1fr 4.5rem', gap: 8, alignItems: 'center', marginBottom: 4, color: 'var(--text)' }}>
      <span style={{ fontFamily: 'monospace' }}>contest {row.contest_id}</span>
      <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 14 }}>
        <div style={{ width: `${Math.min(100, (row.percentage / max) * 100)}%`, height: '100%', borderRadius: 4, background: 'var(--primary)' }} />
      </div>
      <strong>{row.percentage}%</strong>
    </div>)}
  </section>
}

export default function Problem1633() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <PercentBars rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
