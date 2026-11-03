import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with customers, orders and products lists"
const EXAMPLE = "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\"},{\"customer_id\":2,\"name\":\"Ben\"},{\"customer_id\":3,\"name\":\"Cy\"}],\"products\":[{\"product_id\":10,\"product_name\":\"Keyboard\",\"price\":30},{\"product_id\":20,\"product_name\":\"Mouse\",\"price\":12},{\"product_id\":30,\"product_name\":\"Dock\",\"price\":80}],\"orders\":[{\"order_id\":1,\"order_date\":\"2020-01-01\",\"customer_id\":1,\"product_id\":10},{\"order_id\":2,\"order_date\":\"2020-01-05\",\"customer_id\":1,\"product_id\":10},{\"order_id\":3,\"order_date\":\"2020-01-09\",\"customer_id\":1,\"product_id\":20},{\"order_id\":4,\"order_date\":\"2020-02-01\",\"customer_id\":1,\"product_id\":20},{\"order_id\":5,\"order_date\":\"2020-02-02\",\"customer_id\":2,\"product_id\":30},{\"order_id\":6,\"order_date\":\"2020-02-03\",\"customer_id\":2,\"product_id\":10},{\"order_id\":7,\"order_date\":\"2020-02-04\",\"customer_id\":3,\"product_id\":20}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Counting happens per customer and product pair; the maximum is taken within each customer.","Comparing each pair with its customer’s maximum keeps every tie instead of picking one winner."]

const definition = {
  number: '1596',
  title: "The Most Frequently Ordered Products for Each Customer",
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

export default function Problem1596() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
