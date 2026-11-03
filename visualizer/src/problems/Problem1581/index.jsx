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

export default function Problem1581() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
