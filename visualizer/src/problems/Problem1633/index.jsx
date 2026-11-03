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
  examples: [{ label: 'Sample', input: EXAMPLE }],
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

export default function Problem1633() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
