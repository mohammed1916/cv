import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with an orders list"
const EXAMPLE = "{\"orders\":[{\"order_id\":1,\"order_date\":\"2020-01-05\",\"customer_id\":10,\"invoice\":30},{\"order_id\":2,\"order_date\":\"2020-01-20\",\"customer_id\":10,\"invoice\":25},{\"order_id\":3,\"order_date\":\"2020-01-22\",\"customer_id\":11,\"invoice\":20},{\"order_id\":4,\"order_date\":\"2020-02-03\",\"customer_id\":11,\"invoice\":45},{\"order_id\":5,\"order_date\":\"2020-02-03\",\"customer_id\":12,\"invoice\":21},{\"order_id\":6,\"order_date\":\"2020-02-09\",\"customer_id\":12,\"invoice\":21}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["The filter runs before grouping, so an invoice of exactly 20 never reaches the counts.","Distinct counts matter because one customer can place several orders in the same month."]

const definition = {
  number: '1565',
  title: "Unique Orders and Customers Per Month",
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

export default function Problem1565() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
