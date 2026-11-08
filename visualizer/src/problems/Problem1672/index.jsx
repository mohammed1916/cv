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
    { label: 'One customer, one account', input: '[[5]]' },
    { label: 'Equal totals', input: '[[3,3],[2,4]]' },
    { label: 'Zero balances', input: '[[0]]' },
    { label: 'Long run: 30 customers', input: '[[37,34,21,63,91],[68,8,57,86,60],[3,24,34,87,70],[69,78,2,26,5],[93,4,30,72,61],[68,52,25,91,5],[85,30,12,66,23],[48,66,48,100,88],[45,66,55,51,16],[65,76,45,62,3],[63,82,57,91,91],[14,60,96,24,60],[85,7,20,27,89],[53,100,60,88,23],[23,44,7,66,76],[59,32,43,10,13],[72,27,92,56,45],[88,27,78,59,65],[69,56,74,0,17],[84,32,21,95,34],[82,93,82,42,74],[87,66,41,72,14],[35,75,12,49,61],[21,95,21,55,91],[69,48,62,49,45],[77,15,87,57,65],[14,74,54,58,38],[61,22,10,38,26],[68,14,11,34,31],[61,80,60,48,100]]' },
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
