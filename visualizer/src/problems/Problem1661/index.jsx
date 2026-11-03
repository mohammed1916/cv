import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with an activity list"
const EXAMPLE = "{\"activity\":[{\"machine_id\":0,\"process_id\":0,\"activity_type\":\"start\",\"timestamp\":2},{\"machine_id\":0,\"process_id\":0,\"activity_type\":\"end\",\"timestamp\":9},{\"machine_id\":0,\"process_id\":1,\"activity_type\":\"start\",\"timestamp\":4},{\"machine_id\":0,\"process_id\":1,\"activity_type\":\"end\",\"timestamp\":12},{\"machine_id\":1,\"process_id\":0,\"activity_type\":\"start\",\"timestamp\":1},{\"machine_id\":1,\"process_id\":0,\"activity_type\":\"end\",\"timestamp\":4},{\"machine_id\":1,\"process_id\":1,\"activity_type\":\"start\",\"timestamp\":2},{\"machine_id\":1,\"process_id\":1,\"activity_type\":\"end\",\"timestamp\":4},{\"machine_id\":1,\"process_id\":2,\"activity_type\":\"start\",\"timestamp\":5},{\"machine_id\":1,\"process_id\":2,\"activity_type\":\"end\",\"timestamp\":11}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["The pairing uses both the machine and the process, since one machine runs several processes.","Each process is measured once, so the average is over processes, not over raw log lines."]

const definition = {
  number: '1661',
  title: "Average Time of Process per Machine",
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

export default function Problem1661() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
