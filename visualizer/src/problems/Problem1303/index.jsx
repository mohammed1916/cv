import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Employee table as JSON',
  url: 'https://leetcode.com/problems/find-the-team-size/',
  complexity: 'Walkthrough: one count per team, then one lookup per employee.',
  examples: [{ label: 'Sample employees', input: JSON.stringify(sample) }, { label: 'Single employee', input: '{"employee":[{"employee_id":1,"team_id":9}]}' }, { label: 'Tied team sizes', input: '{"employee":[{"employee_id":1,"team_id":10},{"employee_id":2,"team_id":10},{"employee_id":3,"team_id":20},{"employee_id":4,"team_id":20}]}' }, { label: 'Largest ids', input: '{"employee":[{"employee_id":999,"team_id":1000},{"employee_id":1,"team_id":1000}]}' }, { label: 'Long run: 12 employees', input: '{"employee":[{"employee_id":1,"team_id":20},{"employee_id":2,"team_id":30},{"employee_id":3,"team_id":20},{"employee_id":4,"team_id":40},{"employee_id":5,"team_id":20},{"employee_id":6,"team_id":10},{"employee_id":7,"team_id":20},{"employee_id":8,"team_id":10},{"employee_id":9,"team_id":10},{"employee_id":10,"team_id":30},{"employee_id":11,"team_id":30},{"employee_id":12,"team_id":30}]}' }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindTheTeamSize() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Team sizes</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Walkthrough of the query stages on invented sample rows. The table is invented.</p>
    <p>The team size is computed once per team and then reused for every employee on that team.</p>
    <p>A team of one still reports a size of one.</p>
  </>} />
}
