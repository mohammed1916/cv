import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with users and transactions lists"
const EXAMPLE = "{\"users\":[{\"user_id\":1,\"user_name\":\"Alice\",\"credit\":100},{\"user_id\":2,\"user_name\":\"Bob\",\"credit\":50},{\"user_id\":3,\"user_name\":\"Cara\",\"credit\":20}],\"transactions\":[{\"trans_id\":1,\"paid_by\":1,\"paid_to\":2,\"amount\":30},{\"trans_id\":2,\"paid_by\":2,\"paid_to\":3,\"amount\":90}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Totals are taken separately for outgoing and incoming transfers, then combined with the stored credit.","A user with no transfers still appears because the user list is the starting table."]

const definition = {
  number: '1555',
  title: "Bank Account Summary",
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

export default function Problem1555() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
