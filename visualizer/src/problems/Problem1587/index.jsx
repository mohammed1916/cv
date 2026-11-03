import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with users and transactions lists"
const EXAMPLE = "{\"users\":[{\"account\":310001,\"name\":\"Rhea\"},{\"account\":310002,\"name\":\"Omar\"},{\"account\":310003,\"name\":\"Lena\"},{\"account\":310004,\"name\":\"Tomas\"}],\"transactions\":[{\"trans_id\":1,\"account\":310001,\"amount\":6000,\"transacted_on\":\"2020-08-01\"},{\"trans_id\":2,\"account\":310001,\"amount\":5000,\"transacted_on\":\"2020-09-01\"},{\"trans_id\":3,\"account\":310001,\"amount\":-2000,\"transacted_on\":\"2020-09-02\"},{\"trans_id\":4,\"account\":310002,\"amount\":1500,\"transacted_on\":\"2020-01-20\"},{\"trans_id\":5,\"account\":310002,\"amount\":2500,\"transacted_on\":\"2020-08-25\"},{\"trans_id\":6,\"account\":310003,\"amount\":12000,\"transacted_on\":\"2020-06-01\"},{\"trans_id\":7,\"account\":310004,\"amount\":15000,\"transacted_on\":\"2020-07-01\"},{\"trans_id\":8,\"account\":310001,\"amount\":1500,\"transacted_on\":\"2020-10-01\"}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Withdrawals are simply negative amounts, so one sum per account gives the balance.","The threshold is applied after grouping, which is why it is a HAVING-style check."]

const definition = {
  number: '1587',
  title: "Bank Account Summary II",
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

export default function Problem1587() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
