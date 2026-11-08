import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
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
    { label: 'Single shift', input: '{"EmployeeShifts":[{"shift_id":1,"employee_id":4,"start_time":0,"end_time":30}]}' },
    { label: 'Touching shifts, same employee', input: '{"EmployeeShifts":[{"shift_id":1,"employee_id":2,"start_time":0,"end_time":60},{"shift_id":2,"employee_id":2,"start_time":60,"end_time":90}]}' },
    { label: 'Equal times, different staff', input: '{"EmployeeShifts":[{"shift_id":1,"employee_id":5,"start_time":540,"end_time":600},{"shift_id":2,"employee_id":6,"start_time":540,"end_time":600}]}' },
    { label: 'Long run: twelve generated shifts', input: '{"EmployeeShifts":[{"shift_id":1,"employee_id":1,"start_time":650,"end_time":718},{"shift_id":2,"employee_id":4,"start_time":502,"end_time":620},{"shift_id":3,"employee_id":3,"start_time":351,"end_time":458},{"shift_id":4,"employee_id":2,"start_time":1093,"end_time":1153},{"shift_id":5,"employee_id":1,"start_time":114,"end_time":161},{"shift_id":6,"employee_id":4,"start_time":1157,"end_time":1185},{"shift_id":7,"employee_id":3,"start_time":36,"end_time":147},{"shift_id":8,"employee_id":2,"start_time":279,"end_time":343},{"shift_id":9,"employee_id":1,"start_time":1130,"end_time":1171},{"shift_id":10,"employee_id":4,"start_time":487,"end_time":565},{"shift_id":11,"employee_id":3,"start_time":806,"end_time":870},{"shift_id":12,"employee_id":2,"start_time":161,"end_time":175}]}' },
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
    <IntervalView title="Shifts per employee (the pair being compared is highlighted)"
      intervals={run.input.EmployeeShifts.map(shift => ({
        start: shift.start_time, end: shift.end_time, group: `Employee ${shift.employee_id}`,
        label: `#${shift.shift_id}`, role: step.pair && step.pair.includes(shift.shift_id) ? 'current' : 'pending',
      }))}
      note="Each bar is one shift in minutes. Half-open ranges: a shift that ends exactly when another starts does not overlap it." />
    <RowsTable caption="Overlap counts so far" columns={['employee_id', 'overlapping_shifts']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} employee row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={() => <>
    <p>Each pair of shifts is checked once, using the shift_id order so a pair is never counted twice.</p>
    <p>Two half-open minute ranges overlap when each starts before the other ends. Shifts that only touch at 5 minutes do not overlap.</p>
  </>} />
}
