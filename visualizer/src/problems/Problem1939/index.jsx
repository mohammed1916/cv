import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const definition = {
  number: '1939',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  sql,
  inputLabel: 'JSON object with confirmations rows [user_id, "YYYY-MM-DD HH:MM:SS", action]',
  url: 'https://leetcode.com/problems/users-that-actively-request-confirmation-messages/',
  complexity: 'O(r²) for the self-join of r rows in this trace; a database answers the same query with an index on (user_id, time_stamp).',
  examples: [
    { label: 'Mixed users', input: '{"confirmations":[[2,"2024-01-01 10:00:00","confirmed"],[2,"2024-01-02 10:00:00","timeout"],[3,"2024-01-01 12:00:00","confirmed"],[3,"2024-01-01 12:06:59","timeout"],[6,"2024-01-01 09:00:00","confirmed"],[6,"2024-01-03 09:01:00","timeout"]]}' },
  ],
}

export default function Problem1939Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <p>Stage: <strong>{step.stage}</strong></p>
      <table aria-label={`Rows after ${step.stage}`} style={{ borderCollapse: 'collapse' }}>
        <thead><tr>{step.cols.map(c => <th key={c} style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>{c}</th>)}</tr></thead>
        <tbody>
          {step.rows.length === 0 && <tr><td colSpan={step.cols.length}><em>no rows</em></td></tr>}
          {step.rows.map((row, i) => <tr key={i} style={{ background: step.match.includes(row[0]) && step.stage !== 'source' ? 'color-mix(in srgb, var(--success) 14%, transparent)' : 'transparent' }}>
            {row.map((v, k) => <td key={k} style={{ padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>{String(v)}</td>)}
          </tr>)}
        </tbody>
      </table>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
