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
  examples: [{ label: 'Sample', input: EXAMPLE },
    { label: "One student per school", input: "{\"SchoolA\":[{\"student_id\":1,\"student_name\":\"Ada\"}],\"SchoolB\":[{\"student_id\":2,\"student_name\":\"Bo\"}],\"SchoolC\":[{\"student_id\":3,\"student_name\":\"Cy\"}]}" },
    { label: "Same id at two schools", input: "{\"SchoolA\":[{\"student_id\":1,\"student_name\":\"Ada\"}],\"SchoolB\":[{\"student_id\":1,\"student_name\":\"Ada\"},{\"student_id\":2,\"student_name\":\"Bo\"}],\"SchoolC\":[{\"student_id\":3,\"student_name\":\"Cy\"}]}" },
    { label: "Six students each", input: "{\"SchoolA\":[{\"student_id\":1,\"student_name\":\"A0\"},{\"student_id\":2,\"student_name\":\"A1\"},{\"student_id\":3,\"student_name\":\"A2\"},{\"student_id\":4,\"student_name\":\"A3\"},{\"student_id\":5,\"student_name\":\"A4\"},{\"student_id\":6,\"student_name\":\"A5\"}],\"SchoolB\":[{\"student_id\":7,\"student_name\":\"B0\"},{\"student_id\":8,\"student_name\":\"B1\"},{\"student_id\":9,\"student_name\":\"B2\"},{\"student_id\":10,\"student_name\":\"B3\"},{\"student_id\":11,\"student_name\":\"B4\"},{\"student_id\":12,\"student_name\":\"B5\"}],\"SchoolC\":[{\"student_id\":13,\"student_name\":\"C0\"},{\"student_id\":14,\"student_name\":\"C1\"},{\"student_id\":15,\"student_name\":\"C2\"},{\"student_id\":16,\"student_name\":\"C3\"},{\"student_id\":17,\"student_name\":\"C4\"},{\"student_id\":18,\"student_name\":\"C5\"}]}" },
    { label: "Long run: six students each", input: "{\"SchoolA\":[{\"student_id\":59,\"student_name\":\"A0\"},{\"student_id\":34,\"student_name\":\"A1\"},{\"student_id\":19,\"student_name\":\"A2\"},{\"student_id\":53,\"student_name\":\"A3\"},{\"student_id\":54,\"student_name\":\"A4\"},{\"student_id\":38,\"student_name\":\"A5\"}],\"SchoolB\":[{\"student_id\":93,\"student_name\":\"B0\"},{\"student_id\":24,\"student_name\":\"B1\"},{\"student_id\":91,\"student_name\":\"B2\"},{\"student_id\":85,\"student_name\":\"B3\"},{\"student_id\":66,\"student_name\":\"B4\"},{\"student_id\":87,\"student_name\":\"B5\"}],\"SchoolC\":[{\"student_id\":43,\"student_name\":\"C0\"},{\"student_id\":64,\"student_name\":\"C1\"},{\"student_id\":45,\"student_name\":\"C2\"},{\"student_id\":58,\"student_name\":\"C3\"},{\"student_id\":7,\"student_name\":\"C4\"},{\"student_id\":40,\"student_name\":\"C5\"}]}" }],
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

function CandidateList({ rows }) {
  if (rows.length === 0 || !('valid' in rows[0])) return null
  return <section aria-label="Candidate triplets">
    <h4>Candidates, one student from each school</h4>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {rows.map((row, index) => <span key={index} style={{ padding: '6px 10px', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text)',
        border: '1px solid var(--border)',
        background: row.valid ? 'color-mix(in srgb, var(--success) 25%, transparent)' : 'color-mix(in srgb, var(--error) 18%, transparent)',
        textDecoration: row.valid ? 'none' : 'line-through' }}>
        ({row.member_A}, {row.member_B}, {row.member_C}) {row.valid ? 'kept' : 'rejected'}
      </span>)}
    </div>
  </section>
}

export default function Problem1623() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <CandidateList rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
