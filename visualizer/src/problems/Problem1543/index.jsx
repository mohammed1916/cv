import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with a sales list (sale_id, product_name, sale_date)"
const EXAMPLE = "{\"sales\":[{\"sale_id\":1,\"product_name\":\"  Apple \",\"sale_date\":\"2020-05-01\"},{\"sale_id\":2,\"product_name\":\"apple\",\"sale_date\":\"2020-05-09\"},{\"sale_id\":3,\"product_name\":\"Banana\",\"sale_date\":\"2020-06-15\"},{\"sale_id\":4,\"product_name\":\"APPLE \",\"sale_date\":\"2020-06-02\"}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Normalize first so that spelling variants of one product land in the same group.","The month is the first seven characters of the date, so each group is one name in one calendar month."]

const definition = {
  number: '1543',
  title: "Fix Product Name Format",
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

export default function Problem1543() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
