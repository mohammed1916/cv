import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with visits and transactions lists"
const EXAMPLE = "{\"visits\":[{\"visit_id\":3,\"customer_id\":14},{\"visit_id\":4,\"customer_id\":7},{\"visit_id\":6,\"customer_id\":41},{\"visit_id\":9,\"customer_id\":7},{\"visit_id\":10,\"customer_id\":88},{\"visit_id\":11,\"customer_id\":7}],\"transactions\":[{\"transaction_id\":21,\"visit_id\":9,\"amount\":45},{\"transaction_id\":22,\"visit_id\":9,\"amount\":60},{\"transaction_id\":23,\"visit_id\":3,\"amount\":12},{\"transaction_id\":24,\"visit_id\":10,\"amount\":80}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["A left join keeps every visit, and the rows without a transaction are the ones to count.","Visit 9 has two transactions but is not silent: it is one visit with activity, so it is excluded once."]

const definition = {
  number: '1581',
  title: "Customer Who Visited but Did Not Make Any Transactions",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE },
    { label: "Single visit, no transactions", input: "{\"visits\":[{\"visit_id\":1,\"customer_id\":5}],\"transactions\":[]}" },
    { label: "Same customer, one silent visit", input: "{\"visits\":[{\"visit_id\":1,\"customer_id\":7},{\"visit_id\":2,\"customer_id\":7}],\"transactions\":[{\"transaction_id\":10,\"visit_id\":1,\"amount\":5}]}" },
    { label: "Twelve visits, none with transactions", input: "{\"visits\":[{\"visit_id\":1,\"customer_id\":100},{\"visit_id\":2,\"customer_id\":101},{\"visit_id\":3,\"customer_id\":102},{\"visit_id\":4,\"customer_id\":103},{\"visit_id\":5,\"customer_id\":104},{\"visit_id\":6,\"customer_id\":105},{\"visit_id\":7,\"customer_id\":106},{\"visit_id\":8,\"customer_id\":107},{\"visit_id\":9,\"customer_id\":108},{\"visit_id\":10,\"customer_id\":109},{\"visit_id\":11,\"customer_id\":110},{\"visit_id\":12,\"customer_id\":111}],\"transactions\":[]}" },
    { label: "Long run: 12 visits, 12 transactions", input: "{\"visits\":[{\"visit_id\":1,\"customer_id\":4},{\"visit_id\":2,\"customer_id\":3},{\"visit_id\":3,\"customer_id\":1},{\"visit_id\":4,\"customer_id\":6},{\"visit_id\":5,\"customer_id\":6},{\"visit_id\":6,\"customer_id\":6},{\"visit_id\":7,\"customer_id\":5},{\"visit_id\":8,\"customer_id\":7},{\"visit_id\":9,\"customer_id\":9},{\"visit_id\":10,\"customer_id\":2},{\"visit_id\":11,\"customer_id\":7},{\"visit_id\":12,\"customer_id\":1}],\"transactions\":[{\"transaction_id\":200,\"visit_id\":3,\"amount\":30},{\"transaction_id\":201,\"visit_id\":10,\"amount\":60},{\"transaction_id\":202,\"visit_id\":7,\"amount\":90},{\"transaction_id\":203,\"visit_id\":4,\"amount\":20},{\"transaction_id\":204,\"visit_id\":3,\"amount\":20},{\"transaction_id\":205,\"visit_id\":1,\"amount\":20},{\"transaction_id\":206,\"visit_id\":9,\"amount\":40},{\"transaction_id\":207,\"visit_id\":3,\"amount\":70},{\"transaction_id\":208,\"visit_id\":10,\"amount\":90},{\"transaction_id\":209,\"visit_id\":7,\"amount\":10},{\"transaction_id\":210,\"visit_id\":12,\"amount\":20},{\"transaction_id\":211,\"visit_id\":12,\"amount\":30}]}" }],
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

function VisitMatch({ rows }) {
  if (rows.length === 0 || !('transactions' in rows[0])) return null
  return <section aria-label="Visits matched to transactions">
    <h4>Each visit against the Transactions table</h4>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {rows.map(row => {
        const silent = row.transactions === 0
        return <span key={row.visit_id} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text)',
          fontFamily: 'monospace', background: silent ? 'color-mix(in srgb, var(--success) 25%, transparent)' : 'var(--surface2)' }}>
          visit {row.visit_id} · customer {row.customer_id} · {silent ? 'no transaction (kept)' : `${row.transactions} transaction${row.transactions === 1 ? '' : 's'} (dropped)`}
        </span>
      })}
    </div>
  </section>
}

export default function Problem1581() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <VisitMatch rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
