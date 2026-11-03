import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with SchoolA, SchoolB and SchoolC lists"
const EXAMPLE = "{\"SchoolA\":[{\"student_id\":1,\"student_name\":\"Ava\"},{\"student_id\":2,\"student_name\":\"Ben\"}],\"SchoolB\":[{\"student_id\":3,\"student_name\":\"Ava\"},{\"student_id\":4,\"student_name\":\"Cy\"}],\"SchoolC\":[{\"student_id\":5,\"student_name\":\"Dee\"},{\"student_id\":1,\"student_name\":\"Ed\"}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Every combination of one student per school is a candidate, then two independent checks reject it.","Ids and names are checked separately, so a shared name can fail even when the ids differ."]

const definition = {
  number: '1623',
  title: "All Valid Triplets That Can Represent a Country",
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

export default function Problem1623() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
