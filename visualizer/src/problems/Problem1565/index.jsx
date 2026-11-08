import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
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
  examples: [{ label: 'Sample', input: EXAMPLE }, { label: 'Single order', input: '{"orders":[{"order_id":1,"order_date":"2021-04-01","customer_id":1,"invoice":10}]}' }, { label: 'Repeat customer in one month', input: '{"orders":[{"order_id":1,"order_date":"2021-04-01","customer_id":1,"invoice":10},{"order_id":2,"order_date":"2021-04-09","customer_id":1,"invoice":20}]}' }, { label: 'No orders', input: '{"orders":[]}' }, { label: 'Long run: 12 orders', input: '{"orders":[{"order_id":1,"order_date":"2021-02-08","customer_id":4,"invoice":60},{"order_id":2,"order_date":"2021-02-20","customer_id":3,"invoice":31},{"order_id":3,"order_date":"2021-01-23","customer_id":4,"invoice":76},{"order_id":4,"order_date":"2021-01-08","customer_id":4,"invoice":65},{"order_id":5,"order_date":"2021-01-16","customer_id":4,"invoice":91},{"order_id":6,"order_date":"2021-01-04","customer_id":4,"invoice":58},{"order_id":7,"order_date":"2021-02-21","customer_id":4,"invoice":96},{"order_id":8,"order_date":"2021-01-04","customer_id":3,"invoice":44},{"order_id":9,"order_date":"2021-02-04","customer_id":3,"invoice":73},{"order_id":10,"order_date":"2021-01-17","customer_id":3,"invoice":33},{"order_id":11,"order_date":"2021-02-23","customer_id":2,"invoice":41},{"order_id":12,"order_date":"2021-01-17","customer_id":4,"invoice":90}]}' }],
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
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
