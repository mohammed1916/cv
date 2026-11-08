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
    { label: "No students", input: "{\"departments\":[{\"id\":1,\"name\":\"Art\"}],\"students\":[]}" },
    { label: "Shared department", input: "{\"departments\":[{\"id\":1,\"name\":\"Art\"},{\"id\":2,\"name\":\"Law\"}],\"students\":[{\"id\":7,\"name\":\"Noa\",\"department_id\":2},{\"id\":8,\"name\":\"Oz\",\"department_id\":2}]}" },
    { label: "Ten departments, students without one", input: "{\"departments\":[{\"id\":1,\"name\":\"Dept 1\"},{\"id\":2,\"name\":\"Dept 2\"},{\"id\":3,\"name\":\"Dept 3\"},{\"id\":4,\"name\":\"Dept 4\"},{\"id\":5,\"name\":\"Dept 5\"},{\"id\":6,\"name\":\"Dept 6\"},{\"id\":7,\"name\":\"Dept 7\"},{\"id\":8,\"name\":\"Dept 8\"},{\"id\":9,\"name\":\"Dept 9\"},{\"id\":10,\"name\":\"Dept 10\"}],\"students\":[{\"id\":100,\"name\":\"S1\",\"department_id\":null},{\"id\":101,\"name\":\"S2\",\"department_id\":null},{\"id\":102,\"name\":\"S3\",\"department_id\":null},{\"id\":103,\"name\":\"S4\",\"department_id\":null},{\"id\":104,\"name\":\"S5\",\"department_id\":null},{\"id\":105,\"name\":\"S6\",\"department_id\":null},{\"id\":106,\"name\":\"S7\",\"department_id\":null},{\"id\":107,\"name\":\"S8\",\"department_id\":null},{\"id\":108,\"name\":\"S9\",\"department_id\":null},{\"id\":109,\"name\":\"S10\",\"department_id\":null},{\"id\":110,\"name\":\"S11\",\"department_id\":null},{\"id\":111,\"name\":\"S12\",\"department_id\":null}]}" },
    { label: "Long run: random assignments", input: "{\"departments\":[{\"id\":1,\"name\":\"Dept 1\"},{\"id\":2,\"name\":\"Dept 2\"},{\"id\":3,\"name\":\"Dept 3\"},{\"id\":4,\"name\":\"Dept 4\"},{\"id\":5,\"name\":\"Dept 5\"},{\"id\":6,\"name\":\"Dept 6\"},{\"id\":7,\"name\":\"Dept 7\"},{\"id\":8,\"name\":\"Dept 8\"},{\"id\":9,\"name\":\"Dept 9\"},{\"id\":10,\"name\":\"Dept 10\"}],\"students\":[{\"id\":100,\"name\":\"S1\",\"department_id\":6},{\"id\":101,\"name\":\"S2\",\"department_id\":2},{\"id\":102,\"name\":\"S3\",\"department_id\":null},{\"id\":103,\"name\":\"S4\",\"department_id\":7},{\"id\":104,\"name\":\"S5\",\"department_id\":1},{\"id\":105,\"name\":\"S6\",\"department_id\":10},{\"id\":106,\"name\":\"S7\",\"department_id\":10},{\"id\":107,\"name\":\"S8\",\"department_id\":null},{\"id\":108,\"name\":\"S9\",\"department_id\":2},{\"id\":109,\"name\":\"S10\",\"department_id\":null},{\"id\":110,\"name\":\"S11\",\"department_id\":6},{\"id\":111,\"name\":\"S12\",\"department_id\":9}]}" },
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
