import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { meta } from './meta'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with as_of (YYYY-MM-DD) and logins (customer_id, login_date)',
  url: 'https://leetcode.com/problems/find-churn-risk-customers/',
  complexity: 'O(r) to scan r login rows, plus a sort of the at-risk customers.',
  examples: [
    {
      label: 'Teaching sample',
      input: JSON.stringify({
        as_of: '2026-06-30',
        logins: [
          { customer_id: 1, login_date: '2026-06-20' }, { customer_id: 1, login_date: '2026-06-28' },
          { customer_id: 2, login_date: '2026-05-01' }, { customer_id: 2, login_date: '2026-05-10' },
          { customer_id: 3, login_date: '2026-05-31' }, { customer_id: 3, login_date: '2026-06-01' },
          { customer_id: 4, login_date: '2026-04-30' }, { customer_id: 6, login_date: '2026-05-31' },
        ],
      }),
    },
    { label: 'Single login', input: '{"as_of":"2026-06-30","logins":[{"customer_id":4,"login_date":"2026-06-30"}]}' },
    { label: 'Same-day logins', input: '{"as_of":"2026-06-30","logins":[{"customer_id":1,"login_date":"2026-06-15"},{"customer_id":1,"login_date":"2026-06-15"}]}' },
    { label: 'Login on the as-of date', input: '{"as_of":"2026-06-30","logins":[{"customer_id":2,"login_date":"2026-06-01"},{"customer_id":2,"login_date":"2026-06-30"}]}' },
    { label: 'Long run: 30 logins', input: '{"as_of":"2026-06-30","logins":[{"customer_id":4,"login_date":"2026-04-15"},{"customer_id":6,"login_date":"2026-04-28"},{"customer_id":8,"login_date":"2026-04-12"},{"customer_id":2,"login_date":"2026-06-14"},{"customer_id":4,"login_date":"2026-05-22"},{"customer_id":6,"login_date":"2026-04-28"},{"customer_id":8,"login_date":"2026-04-08"},{"customer_id":2,"login_date":"2026-06-02"},{"customer_id":4,"login_date":"2026-06-27"},{"customer_id":6,"login_date":"2026-05-05"},{"customer_id":8,"login_date":"2026-04-12"},{"customer_id":2,"login_date":"2026-05-11"},{"customer_id":4,"login_date":"2026-04-11"},{"customer_id":6,"login_date":"2026-04-08"},{"customer_id":8,"login_date":"2026-05-08"},{"customer_id":2,"login_date":"2026-06-24"},{"customer_id":4,"login_date":"2026-04-27"},{"customer_id":6,"login_date":"2026-04-14"},{"customer_id":8,"login_date":"2026-06-22"},{"customer_id":2,"login_date":"2026-05-01"},{"customer_id":4,"login_date":"2026-05-28"},{"customer_id":6,"login_date":"2026-05-11"},{"customer_id":8,"login_date":"2026-06-28"},{"customer_id":2,"login_date":"2026-05-28"},{"customer_id":4,"login_date":"2026-06-16"},{"customer_id":6,"login_date":"2026-05-10"},{"customer_id":8,"login_date":"2026-05-09"},{"customer_id":2,"login_date":"2026-05-24"},{"customer_id":4,"login_date":"2026-05-12"},{"customer_id":6,"login_date":"2026-05-16"}]}' },
  ],
}

function CurrentTable({ table }) {
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{table.rows.length
        ? table.rows.map((row, index) => <tr key={index}>{table.columns.map(column => <td key={column}>{row[column] === null ? '' : String(row[column])}</td>)}</tr>)
        : <tr><td colSpan={table.columns.length}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

export default function FindChurnRiskCustomers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={phases} active={step.phase} />
    <CurrentTable table={step.table} />
  </>} renderReasoning={() => <>
    <p>Each customer last login is the largest login date. Subtracting it from the as-of date gives the idle days.</p>
    <p>A customer is kept when the idle days are at least 30. Grouping first means each customer is judged once, however many logins it has.</p>
  </>} />
}
