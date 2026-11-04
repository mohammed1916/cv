import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with orders and products lists (customers is optional and unused)"
const EXAMPLE = "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\"},{\"customer_id\":2,\"name\":\"Ben\"}],\"products\":[{\"product_id\":10,\"product_name\":\"Keyboard\",\"price\":30},{\"product_id\":20,\"product_name\":\"Mouse\",\"price\":12},{\"product_id\":30,\"product_name\":\"Dock\",\"price\":80}],\"orders\":[{\"order_id\":101,\"order_date\":\"2021-01-05\",\"customer_id\":1,\"product_id\":10},{\"order_id\":102,\"order_date\":\"2021-02-10\",\"customer_id\":2,\"product_id\":10},{\"order_id\":103,\"order_date\":\"2021-02-10\",\"customer_id\":1,\"product_id\":10},{\"order_id\":104,\"order_date\":\"2021-01-20\",\"customer_id\":2,\"product_id\":20},{\"order_id\":105,\"order_date\":\"2021-03-01\",\"customer_id\":1,\"product_id\":20}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Each product gets its own newest date, so a product with an old order and a new order keeps only the new one.","A plain equality test against that newest date keeps ties without any extra ranking step."]

const definition = {
  number: '1549',
  title: "The Most Recent Orders for Each Product",
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

export default function Problem1549() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
