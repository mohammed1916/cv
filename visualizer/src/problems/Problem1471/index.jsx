import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { padding: '4px 8px', fontFamily: 'monospace', border: '1px solid var(--border)', color: '#1c1917' }

const definition = {
  number: '1471',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr and k (JSON)',
  url: 'https://leetcode.com/problems/the-k-strongest-values-in-an-array/',
  complexity: 'O(n log n) time for sorting the values and ranking them by strength; O(n) extra space.',
  examples: [
    { label: 'Sample', input: '{"arr":[1,2,3,4,5],"k":2}' },
    { label: 'Negatives', input: '{"arr":[-7,4,4,10,0],"k":3}' },
    { label: 'Even length', input: '{"arr":[1,2,3,4],"k":2}' },
  ],
}

export default function KStrongestValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <p>{s.median === null ? 'Median not yet chosen.' : `Lower median: ${s.median} (sorted position ${s.medianIndex})`}</p>
      {s.ranked.length > 0 && <table aria-label="Strength ranking" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>value</th><th style={cell}>distance</th><th style={cell}>chosen</th></tr></thead>
        <tbody>{s.ranked.map((item, i) => <tr key={i} style={{ background: s.chosen.includes(item.value) ? '#bbf7d0' : 'transparent' }}>
          <td style={cell}>{item.value}</td><td style={cell}>{item.distance}</td><td style={cell}>{s.chosen.includes(item.value) ? 'yes' : ''}</td>
        </tr>)}</tbody>
      </table>}
      {s.chosen.length > 0 && <p>{`Chosen so far: ${s.chosen.join(', ')}`}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Lower median:</strong> the position (n - 1) // 2 in sorted order picks one fixed middle value, even when n is even.</p>
    <p><strong>Ties:</strong> when two values are equally far from the median, the larger value counts as stronger.</p>
  </>} />
}
