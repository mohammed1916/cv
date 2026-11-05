import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const definition = {
  number: '1949',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  sql,
  inputLabel: 'JSON object with friendship: [user1_id, user2_id] pairs with user1_id < user2_id',
  url: 'https://leetcode.com/problems/strong-friendship/',
  complexity: 'O(f · d) for f friendships and average degree d in this trace; a database uses the same self-join with an index on the pair.',
  examples: [
    { label: 'Dense group', input: '{"friendship":[[1,2],[1,3],[1,4],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5]]}' },
    { label: 'Sparse', input: '{"friendship":[[1,2],[1,3],[2,3],[2,4],[3,4]]}' },
  ],
}

export default function Problem1949Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <p>Stage: <strong>{step.stage}</strong></p>
      <table aria-label={`Rows after ${step.stage}`} style={{ borderCollapse: 'collapse' }}>
        <thead><tr>{step.cols.map(c => <th key={c} style={{ padding: '4px 8px', border: '1px solid var(--border)' }}>{c}</th>)}</tr></thead>
        <tbody>
          {step.rows.length === 0 && <tr><td colSpan={step.cols.length}><em>no rows</em></td></tr>}
          {step.rows.map((row, i) => <tr key={i}>
            {row.map((v, k) => <td key={k} style={{ padding: '4px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', background: k === 2 && step.stage !== 'source' && v >= 3 ? 'color-mix(in srgb, var(--success, #16a34a) 16%, transparent)' : 'transparent' }}>{String(v)}</td>)}
          </tr>)}
        </tbody>
      </table>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
