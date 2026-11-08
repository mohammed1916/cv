import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of LogInfo rows'
const complexity = 'Compares every pair of sessions of the same account, so the cost grows with the square of sessions per account. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"account_id":1,"ip_address":10,"login":1,"logout":5},{"account_id":1,"ip_address":20,"login":5,"logout":9},{"account_id":2,"ip_address":10,"login":1,"logout":4},{"account_id":2,"ip_address":20,"login":5,"logout":9},{"account_id":3,"ip_address":10,"login":2,"logout":8},{"account_id":3,"ip_address":10,"login":3,"logout":6},{"account_id":4,"ip_address":30,"login":1,"logout":10},{"account_id":4,"ip_address":40,"login":4,"logout":5},{"account_id":5,"ip_address":50,"login":1,"logout":2}]',
}, { label: 'Single session', input: "[{\"account_id\":1,\"ip_address\":10,\"login\":1,\"logout\":2}]" }, { label: 'Touching endpoints overlap', input: "[{\"account_id\":7,\"ip_address\":1,\"login\":1,\"logout\":4},{\"account_id\":7,\"ip_address\":2,\"login\":4,\"logout\":6}]" }, { label: 'Same IP never flags', input: "[{\"account_id\":8,\"ip_address\":3,\"login\":1,\"logout\":5},{\"account_id\":8,\"ip_address\":3,\"login\":2,\"logout\":9}]" }, { label: 'Long run: 12 sessions', input: "[{\"account_id\":2,\"ip_address\":1,\"login\":9,\"logout\":12},{\"account_id\":1,\"ip_address\":3,\"login\":4,\"logout\":7},{\"account_id\":1,\"ip_address\":1,\"login\":1,\"logout\":4},{\"account_id\":4,\"ip_address\":3,\"login\":8,\"logout\":10},{\"account_id\":3,\"ip_address\":3,\"login\":3,\"logout\":3},{\"account_id\":2,\"ip_address\":3,\"login\":1,\"logout\":2},{\"account_id\":4,\"ip_address\":1,\"login\":11,\"logout\":15},{\"account_id\":2,\"ip_address\":2,\"login\":10,\"logout\":12},{\"account_id\":4,\"ip_address\":3,\"login\":12,\"logout\":13},{\"account_id\":2,\"ip_address\":3,\"login\":15,\"logout\":16},{\"account_id\":4,\"ip_address\":1,\"login\":8,\"logout\":11},{\"account_id\":1,\"ip_address\":1,\"login\":8,\"logout\":10}]" }]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse' }}>
      <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

// Sessions of each account on one minute axis. The two sessions being compared are highlighted.
function Timeline({ input, pair }) {
  const max = Math.max(...input.map(r => r.logout), 1)
  const pct = t => `${(t / max) * 100}%`
  const accounts = [...new Set(input.map(r => r.account_id))].sort((a, b) => a - b)
  const isPair = row => pair.some(p => p.account_id === row.account_id && p.ip_address === row.ip_address && p.login === row.login && p.logout === row.logout)
  return <div role="img" aria-label="Login sessions on a time axis" style={{ display: 'grid', gap: 6 }}>
    {accounts.map(account => <div key={account} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 8, alignItems: 'center' }}>
      <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>account {account}</span>
      <div style={{ position: 'relative', height: 30, borderBottom: '1px solid var(--border)' }}>
        {input.filter(r => r.account_id === account).map((r, k) => {
          const hot = isPair(r)
          return <span key={k} title={`IP ${r.ip_address}: ${r.login} to ${r.logout}`} style={{
            position: 'absolute', top: 4 + (k % 2) * 12, height: 10, left: pct(r.login), width: `${((r.logout - r.login) / max) * 100}%`,
            minWidth: 4, boxSizing: 'border-box', borderRadius: 3,
            background: hot ? 'var(--primary)' : 'var(--surface2)', border: `1px solid ${hot ? 'var(--primary)' : 'var(--border)'}`,
          }} />
        })}
      </div>
    </div>)}
    <span style={{ justifySelf: 'end', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted, var(--text))' }}>minute 0 to {max}</span>
  </div>
}

export default function BannedAccountsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pair = step.phase === 'pair' ? step.rows : []
    return <>
      <Timeline input={run.input} pair={pair} />
      <output aria-label="Query output" style={{ display: 'block', margin: '10px 0' }}>{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
      <Rows columns={step.columns} rows={step.rows} />
    </>
  }} renderReasoning={() => <p>Each pair of sessions on different IP addresses is checked with the two overlap comparisons. Touching endpoints count, so a logout at minute 5 and a login at minute 5 flag the account.</p>} />
}
