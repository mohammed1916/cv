import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Patients', description: 'Read every patient and their condition text.' },
  { id: 'scan', label: 'Scan', description: 'Split the codes and test whether one starts with DIAB1.' },
  { id: 'done', label: 'Result', description: 'Return the patients with a matching code.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  number: '1527', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Patients list of { patient_id, patient_name, conditions } rows; conditions is space-separated',
  url: 'https://leetcode.com/problems/patients-with-a-condition/',
  complexity: 'O(total length of the condition text) to scan every code once.',
  examples: [
    { label: 'Example', input: '{"Patients":[{"patient_id":1,"patient_name":"Daniel","conditions":"YFEV COUGH"},{"patient_id":2,"patient_name":"Alice","conditions":"DIAB100 MYOP"},{"patient_id":3,"patient_name":"Bob","conditions":"ACNE DIAB100"},{"patient_id":4,"patient_name":"Carol","conditions":"MYOP DIAB1"},{"patient_id":5,"patient_name":"Dan","conditions":"XDIAB1 DIAB2"}]}' },
    { label: 'Single patient', input: '{"Patients":[{"patient_id":9,"patient_name":"Eve","conditions":"DIAB1"}]}' },
    { label: 'No diabetic code', input: '{"Patients":[{"patient_id":3,"patient_name":"Finn","conditions":"ACNE COUGH"}]}' },
    { label: 'Word must start with DIAB1', input: '{"Patients":[{"patient_id":4,"patient_name":"Gwen","conditions":"XDIAB1 DIAB2 DIAB1Z"}]}' },
    { label: 'Long run: 12 patients', input: '{"Patients":[{"patient_id":1,"patient_name":"Ann","conditions":"MYOP MYOP"},{"patient_id":2,"patient_name":"Ben","conditions":"DIAB1 COUGH"},{"patient_id":3,"patient_name":"Cy","conditions":"ACNE DIAB100"},{"patient_id":4,"patient_name":"Dee","conditions":"MYOP DIAB100"},{"patient_id":5,"patient_name":"Eli","conditions":"COUGH DIAB100"},{"patient_id":6,"patient_name":"Fay","conditions":"YFEV DIAB1"},{"patient_id":7,"patient_name":"Gus","conditions":"DIAB100 MYOP"},{"patient_id":8,"patient_name":"Hal","conditions":"DIAB1 DIAB100"},{"patient_id":9,"patient_name":"Ivy","conditions":"MYOP YFEV"},{"patient_id":10,"patient_name":"Jo","conditions":"YFEV MYOP"},{"patient_id":11,"patient_name":"Kit","conditions":"MYOP ACNE"},{"patient_id":12,"patient_name":"Lu","conditions":"ACNE DIAB100"}]}' },
  ],
}

export default function PatientsWithCondition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>A teaching version with invented sample tables.</p>
    <p>Each condition text is split into codes. A patient matches when some code begins with DIAB1, so a code such as XDIAB1 does not count.</p>
  </>} />
}
