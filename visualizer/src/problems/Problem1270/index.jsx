import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? '')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with employees (employee_id, manager_id); manager_id null marks the top of a tree',
  url: 'https://leetcode.com/problems/all-people-report-to-the-given-manager/',
  complexity: 'O(E) to index the managers, then O(E) to visit each reached employee once. The visualization caps the table at 12 rows.',
  examples: [
    { label: 'Two branches', input: '{"employees":[{"employee_id":1,"manager_id":null},{"employee_id":2,"manager_id":1},{"employee_id":3,"manager_id":2},{"employee_id":4,"manager_id":1},{"employee_id":5,"manager_id":3},{"employee_id":6,"manager_id":4},{"employee_id":7,"manager_id":null},{"employee_id":8,"manager_id":7}]}' },
    { label: 'Only the boss', input: '{"employees":[{"employee_id":1,"manager_id":null},{"employee_id":2,"manager_id":null}]}' },
  ],
}

export default function AllPeopleReportToTheGivenManager() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable label={`Working rows (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>Each employee has at most one manager, so the reporting structure is a tree. Starting from employee 1 and repeatedly adding the reports of anyone reached gives every direct and indirect report.</p>
    <p>A queue keeps the order of the visit simple, and employee 1 is never added to the answer.</p>
  </>} />
}
