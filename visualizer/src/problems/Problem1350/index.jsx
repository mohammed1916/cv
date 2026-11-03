import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with departments and students (small sample tables)',
  url: 'https://leetcode.com/problems/students-with-invalid-departments/',
  complexity: 'With a set of department ids, each student is checked in constant time: O(s + d).',
  examples: [
    { label: 'Example', input: '{"departments":[{"id":1,"name":"Physics"},{"id":2,"name":"Biology"},{"id":3,"name":"History"}],"students":[{"id":10,"name":"Ivy","department_id":1},{"id":11,"name":"Jun","department_id":null},{"id":12,"name":"Kai","department_id":4},{"id":13,"name":"Lea","department_id":2},{"id":14,"name":"Max","department_id":9}]}' },
    { label: 'All valid', input: '{"departments":[{"id":1,"name":"Math"}],"students":[{"id":5,"name":"Ora","department_id":1}]}' },
  ],
}

function RowTable({ label, rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table aria-label={label}>
    <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function StudentsWithInvalidDepartments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable label="Current rows" rows={step.rows} />
    {step.phase === 'output' && <p>Invalid students: {step.rows.map(r => r.name).join(', ') || 'none'}</p>}
  </>} renderReasoning={() => <>
    <p>Each student's department id is looked up in the departments. A student whose id is missing from the departments is reported.</p>
    <p>A NULL department id is skipped here, because it does not point at any department.</p>
  </>} />
}
