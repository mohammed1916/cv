import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with a customers list"
const EXAMPLE = "{\"customers\":[{\"customer_id\":7,\"customer_name\":\"Ana\"},{\"customer_id\":1,\"customer_name\":\"Ben\"},{\"customer_id\":4,\"customer_name\":\"Cy\"},{\"customer_id\":2,\"customer_name\":\"Dee\"}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["The generated range is bounded by the largest existing id, so the list stops where the table stops.","A left join from the generated numbers to Customers leaves unmatched numbers as the gaps."]

const definition = {
  number: '1613',
  title: "Find the Missing IDs",
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

function NumberStrip({ rows }) {
  if (rows.length === 0 || !('id' in rows[0])) return null
  return <section aria-label="Generated numbers">
    <h4>Numbers from 1 upward</h4>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {rows.map(row => {
        const missing = row.has_customer === false
        const known = row.has_customer === true
        return <span key={row.id} style={{ minWidth: 34, padding: '4px 6px', textAlign: 'center', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text)',
          border: '1px solid var(--border)',
          background: missing ? 'color-mix(in srgb, var(--primary) 28%, transparent)' : known ? 'var(--surface2)' : 'transparent' }}>
          {row.id}
        </span>
      })}
    </div>
    {rows.some(row => 'has_customer' in row) && <p style={{ color: 'var(--text-muted)' }}>Shaded purple: no customer has this id, so it is missing.</p>}
  </section>
}

export default function Problem1613() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <NumberStrip rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
