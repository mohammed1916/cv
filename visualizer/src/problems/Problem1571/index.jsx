import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with warehouse and products lists"
const EXAMPLE = "{\"warehouse\":[{\"name\":\"North\",\"product_id\":1,\"units\":2},{\"name\":\"North\",\"product_id\":2,\"units\":1},{\"name\":\"South\",\"product_id\":1,\"units\":3}],\"products\":[{\"product_id\":1,\"product_name\":\"Box\",\"Width\":2,\"Length\":3,\"Height\":4},{\"product_id\":2,\"product_name\":\"Crate\",\"Width\":1,\"Length\":1,\"Height\":5}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Each stock line is priced in volume first, so the sum per warehouse is a sum of volumes rather than of units.","The join uses the product id, so every stock line finds its own box size."]

const definition = {
  number: '1571',
  title: "Warehouse Manager",
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

export default function Problem1571() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
