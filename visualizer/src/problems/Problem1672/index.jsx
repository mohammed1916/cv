import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1672',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Customers as JSON array of balance lists',
  url: 'https://leetcode.com/problems/richest-customer-wealth/',
  complexity: 'O(m * n) time for m customers with n bank balances each, and O(1) extra space beyond the running totals.',
  examples: [
    { label: 'Sample A', input: '[[4,4],[10,1],[3,3,3]]' },
    { label: 'Single bank', input: '[[5],[0,0],[9,2,2]]' },
  ],
}

export default function RichestCustomer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { row, totals = [], best, bestIndex } = step.snapshot
    return <>
      <table aria-label="Customer totals" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>customer</th><th>balances</th><th>total</th></tr></thead>
        <tbody>{run.input.map((balances, i) => <tr key={i} style={{ background: i === row ? 'var(--surface2)' : 'transparent', fontWeight: i === bestIndex ? 700 : 400 }}>
          <td>{i + 1}</td><td>{balances.join(' + ')}</td><td>{totals[i] ?? '-'}</td></tr>)}</tbody>
      </table>
      <p>Best so far: {best}{bestIndex !== null && bestIndex !== undefined ? ` (customer ${bestIndex + 1})` : ''}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two steps per customer:</strong> add the balances of one customer, then compare that customer total with the best total so far.</p>
    <p><strong>Customers, not banks:</strong> the answer is a row total, so individual balances never decide the winner.</p>
  </>} />
}
