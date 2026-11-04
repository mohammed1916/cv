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

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

// The reporting tree under employee 1: each person sits under their manager; reached people are shaded.
function ReportTree({ employees, reached }) {
  const children = new Map()
  for (const e of employees) {
    if (e.manager_id === null) continue
    if (!children.has(e.manager_id)) children.set(e.manager_id, [])
    children.get(e.manager_id).push(e.employee_id)
  }
  const draw = (id, depth) => (children.get(id) ?? []).map(child => <li key={child}>
    <span data-employee={child} style={{
      display: 'inline-block', padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
      border: '1px solid var(--border)',
      background: reached.includes(child) ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)',
    }}>{child}</span>
    {depth < 12 && <ul style={{ margin: '4px 0 4px 18px', padding: 0, listStyle: 'none' }}>{draw(child, depth + 1)}</ul>}
  </li>)
  return <div aria-label="Reporting tree" style={{ overflowX: 'auto' }}>
    <span data-employee={BOSS_ID} style={{ display: 'inline-block', padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)', border: '2px solid var(--text)' }}>{BOSS_ID} (boss)</span>
    <ul style={{ margin: '4px 0 4px 18px', padding: 0, listStyle: 'none' }}>{draw(BOSS_ID, 0)}</ul>
  </div>
}

const BOSS_ID = 1

export default function AllPeopleReportToTheGivenManager() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <ReportTree employees={run.input.employees} reached={step.rows.map(r => r.employee_id)} />
    <RowTable label={`Working rows (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>Each employee has at most one manager, so the reporting structure is a tree. Starting from employee 1 and repeatedly adding the reports of anyone reached gives every direct and indirect report.</p>
    <p>A queue keeps the order of the visit simple, and employee 1 is never added to the answer.</p>
  </>} />
}
