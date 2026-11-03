import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const mixed = '{"EmployeeShifts":[{"shift_id":1,"employee_id":7,"start_time":0,"end_time":60},{"shift_id":2,"employee_id":7,"start_time":30,"end_time":90},{"shift_id":3,"employee_id":7,"start_time":90,"end_time":120},{"shift_id":4,"employee_id":9,"start_time":0,"end_time":10},{"shift_id":5,"employee_id":9,"start_time":5,"end_time":15},{"shift_id":6,"employee_id":9,"start_time":10,"end_time":20}]}'
const touching = '{"EmployeeShifts":[{"shift_id":1,"employee_id":4,"start_time":0,"end_time":5},{"shift_id":2,"employee_id":4,"start_time":5,"end_time":10}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with EmployeeShifts rows (shift_id, employee_id, start_time, end_time in minutes)',
  url: 'https://leetcode.com/problems/find-overlapping-shifts/description/',
  complexity: 'O(s^2) pair checks for s shifts. The visualization caps the table at 12 shifts.',
  examples: [
    { label: 'Mixed shifts', input: mixed },
    { label: 'Touching only', input: touching },
  ],
}

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function FindOverlappingShifts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption="Overlap counts so far" columns={['employee_id', 'overlap_count']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} employee row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={() => <>
    <p>Each pair of shifts is checked once, using the shift_id order so a pair is never counted twice.</p>
    <p>Two half-open minute ranges overlap when each starts before the other ends. Shifts that only touch at 5 minutes do not overlap.</p>
  </>} />
}
