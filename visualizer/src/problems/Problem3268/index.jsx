import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const mixed = '{"EmployeeShifts":[{"shift_id":1,"employee_id":7,"start_time":0,"end_time":60},{"shift_id":2,"employee_id":7,"start_time":30,"end_time":90},{"shift_id":3,"employee_id":7,"start_time":90,"end_time":120},{"shift_id":4,"employee_id":9,"start_time":0,"end_time":10},{"shift_id":5,"employee_id":9,"start_time":5,"end_time":15},{"shift_id":6,"employee_id":9,"start_time":10,"end_time":20},{"shift_id":7,"employee_id":3,"start_time":0,"end_time":5}]}'
const backToBack = '{"EmployeeShifts":[{"shift_id":1,"employee_id":4,"start_time":0,"end_time":5},{"shift_id":2,"employee_id":4,"start_time":5,"end_time":10}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with EmployeeShifts rows (employee_id, start_time, end_time in minutes; shift_id is optional)',
  url: 'https://leetcode.com/problems/find-overlapping-shifts-ii/description/',
  complexity: 'O(s log s + s^2) for s shifts: one sort for the sweep and one pass over shift pairs for the overlap minutes. The visualization caps the table at 12 shifts.',
  examples: [
    { label: 'Mixed shifts', input: mixed },
    { label: 'Back to back', input: backToBack },
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

export default function FindOverlappingShiftsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IntervalView title="Shifts on a minute line, one track per employee" intervals={step.intervals} marker={step.marker}
      markerLabel="sweep position" note="Bars are shifts. The marker is the minute the current event happens, and the active label shows shifts covering it." />
    <p>{step.currentEmployee !== undefined ? `Employee ${step.currentEmployee} is being updated.` : 'Pairs of shifts are compared below.'}</p>
    <RowsTable caption="Peak and overlap minutes so far" columns={['employee_id', 'max_overlapping_shifts', 'total_overlap_duration']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} employee row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each shift becomes a start event (+1) and an end event (-1). Ends sort before starts at the same minute, so back-to-back shifts never overlap.</p>
    <p>The running total per employee gives the peak. Each pair where one shift starts before another ends adds the shared minutes to the total.</p>
  </>} />
}
