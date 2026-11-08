import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every meeting.' },
    { id: 'compare', label: 'Compare', description: 'Check one pair of meetings for overlap.' },
    { id: 'count', label: 'Count', description: 'Total the overlapping pairs for one employee.' },
    { id: 'flag', label: 'Overbooked', description: 'The count reaches the threshold.' },
    { id: 'skip', label: 'Below', description: 'The count stays under the threshold.' },
    { id: 'order', label: 'Order', description: 'Sort by overlaps, then by name.' },
    { id: 'done', label: 'Result', description: 'Report the overbooked employees.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with employees, meetings and a threshold',
  complexity: 'O(M^2) pair checks per employee with M meetings.',
  examples: [
    { label: 'Sample', input: SAMPLE_TEXT },
    { label: 'One meeting', input: '{"threshold":1,"employees":[{"employee_id":1,"name":"Ana"}],"meetings":[{"meeting_id":1,"employee_id":1,"start_hour":9,"end_hour":10}]}' },
    { label: 'Back to back, no overlap', input: '{"threshold":2,"employees":[{"employee_id":1,"name":"Ana"}],"meetings":[{"meeting_id":1,"employee_id":1,"start_hour":9,"end_hour":10},{"meeting_id":2,"employee_id":1,"start_hour":10,"end_hour":11}]}' },
    { label: 'Threshold equals meeting count', input: '{"threshold":3,"employees":[{"employee_id":1,"name":"Ana"}],"meetings":[{"meeting_id":1,"employee_id":1,"start_hour":9,"end_hour":12},{"meeting_id":2,"employee_id":1,"start_hour":10,"end_hour":13},{"meeting_id":3,"employee_id":1,"start_hour":11,"end_hour":14}]}' },
    { label: 'Long run: 8 employees, 24 meetings', input: '{"threshold":3,"employees":[{"employee_id":1,"name":"Ana"},{"employee_id":2,"name":"Ben"},{"employee_id":3,"name":"Cleo"},{"employee_id":4,"name":"Dee"},{"employee_id":5,"name":"Eli"},{"employee_id":6,"name":"Fay"},{"employee_id":7,"name":"Gil"},{"employee_id":8,"name":"Hana"}],"meetings":[{"meeting_id":1,"employee_id":6,"start_hour":12,"end_hour":15},{"meeting_id":2,"employee_id":5,"start_hour":9,"end_hour":12},{"meeting_id":3,"employee_id":2,"start_hour":3,"end_hour":4},{"meeting_id":4,"employee_id":7,"start_hour":5,"end_hour":7},{"meeting_id":5,"employee_id":7,"start_hour":2,"end_hour":4},{"meeting_id":6,"employee_id":1,"start_hour":13,"end_hour":16},{"meeting_id":7,"employee_id":6,"start_hour":18,"end_hour":20},{"meeting_id":8,"employee_id":2,"start_hour":8,"end_hour":11},{"meeting_id":9,"employee_id":1,"start_hour":9,"end_hour":10},{"meeting_id":10,"employee_id":2,"start_hour":11,"end_hour":15},{"meeting_id":11,"employee_id":1,"start_hour":1,"end_hour":2},{"meeting_id":12,"employee_id":8,"start_hour":4,"end_hour":6},{"meeting_id":13,"employee_id":8,"start_hour":14,"end_hour":17},{"meeting_id":14,"employee_id":4,"start_hour":15,"end_hour":16},{"meeting_id":15,"employee_id":6,"start_hour":2,"end_hour":3},{"meeting_id":16,"employee_id":5,"start_hour":3,"end_hour":7},{"meeting_id":17,"employee_id":6,"start_hour":16,"end_hour":20},{"meeting_id":18,"employee_id":4,"start_hour":13,"end_hour":15},{"meeting_id":19,"employee_id":1,"start_hour":11,"end_hour":13},{"meeting_id":20,"employee_id":6,"start_hour":3,"end_hour":7},{"meeting_id":21,"employee_id":1,"start_hour":15,"end_hour":19},{"meeting_id":22,"employee_id":4,"start_hour":2,"end_hour":6},{"meeting_id":23,"employee_id":6,"start_hour":3,"end_hour":4},{"meeting_id":24,"employee_id":6,"start_hour":4,"end_hour":6}]}' },
  ],
}

const cell = { border: '1px solid currentColor', padding: '4px 8px' }

function Rows({ columns = [], rows = [] }) {
  if (rows.length === 0) return <p>No rows yet.</p>
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(c => <th key={c} style={cell}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c} style={cell}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindOverbookedEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two meetings overlap when each starts before the other ends. Every pair is checked once.</p>
    <p>Touching meetings, where one ends exactly when the next starts, do not count as overlapping.</p>
  </>} />
}
