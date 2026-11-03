import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with Product and Invoice lists"
const EXAMPLE = "{\"Product\":[{\"product_id\":1,\"name\":\"LC Phone\"},{\"product_id\":2,\"name\":\"LC T-Shirt\"},{\"product_id\":3,\"name\":\"LC Book\"}],\"Invoice\":[{\"invoice_id\":1,\"product_id\":1,\"rest\":10,\"paid\":30,\"canceled\":15,\"refunded\":20},{\"invoice_id\":2,\"product_id\":1,\"rest\":20,\"paid\":40,\"canceled\":30,\"refunded\":10},{\"invoice_id\":3,\"product_id\":2,\"rest\":20,\"paid\":40,\"canceled\":20,\"refunded\":20}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["A left join keeps products with no invoices, and coalescing turns their empty sums into zero.","Totals are per product, so the outer table decides which rows exist and the invoice table only adds amounts."]

const definition = {
  number: '1677',
  title: "Product's Worth Over Invoices",
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

export default function Problem1677() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
