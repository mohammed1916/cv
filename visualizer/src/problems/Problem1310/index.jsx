import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1310',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and inclusive queries (JSON)',
  url: 'https://leetcode.com/problems/xor-queries-of-a-subarray/',
  complexity: 'O(n + q) time after the prefix build, and O(n) space for the prefix array.',
  examples: [
    { label: 'Mixed', input: '{"arr":[5,2,6,7],"queries":[[0,2],[1,3],[2,2]]}' },
    { label: 'Single', input: '{"arr":[9],"queries":[[0,0]]}' },
    { label: 'Whole row', input: '{"arr":[1,2,3,4],"queries":[[0,3]]}' },
  ],
}

export default function XorQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, pre, query } = step.snapshot
    const [l, r] = query ?? []
    return <>
      <table aria-label="Prefix XOR table" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>Index</th>{pre.map((_, i) => <th key={i}>{i}</th>)}</tr></thead>
        <tbody>
          <tr><th>Prefix</th>{pre.map((v, i) => <td key={i} data-prefix={i} style={{ padding: 4, border: '1px solid var(--border)',
            background: query && (i === r + 1 || i === l) ? 'var(--surface2)' : 'transparent' }}>{v}</td>)}</tr>
          <tr><th>Value</th><td />{arr.map((v, i) => <td key={i} style={{ padding: 4 }}>{v}</td>)}</tr>
        </tbody>
      </table>
      <p role="status">{query ? `Query [${l}, ${r}] answers ${run.result[step.snapshot.answers.length - 1]}.` : 'Each prefix holds the XOR from the start to that position.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Cancellation:</strong> XOR of a value with itself is 0, so the prefix after r XOR the prefix before l keeps exactly the values from l through r.</p>
    <p><strong>Why precompute:</strong> the prefixes are built once, so each query costs two lookups instead of a loop.</p>
  </>} />
}
