import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1458',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (JSON)',
  url: 'https://leetcode.com/problems/max-dot-product-of-two-subsequences/',
  complexity: 'O(m * n) time and O(m * n) space for lists of lengths m and n; this view caps each list at 12 values.',
  examples: [
    { label: 'Pair across lists', input: '{"nums1":[3,-1,4],"nums2":[2,6,-5]}' },
    { label: 'All negative', input: '{"nums1":[-1,-2],"nums2":[1,2]}' },
    { label: 'Single pair', input: '{"nums1":[1,2],"nums2":[3]}' },
  ],
}

const fmt = v => (v === null ? '-inf' : String(v))

export default function MaxDotProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums1, nums2, i, j, table, pair, a, b } = step.snapshot
    return <>
      <div role="img" aria-label="Dynamic programming table" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 13 }}>
          <thead>
            <tr>
              <th />
              <th>0</th>
              {nums2.map((v, c) => <th key={c}>{v}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((row, r) => <tr key={r}>
              <th>{r === 0 ? '0' : nums1[r - 1]}</th>
              {row.map((v, c) => {
                const current = r === i && c === j
                return <td key={c} data-cell={`${r},${c}`} style={{
                  padding: '4px 8px', border: `${current ? 2 : 1}px solid ${current ? 'var(--text)' : 'var(--border)'}`,
                  background: current ? 'var(--surface2)' : 'transparent', textAlign: 'right', color: 'inherit',
                }}>{fmt(v)}</td>
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
      <p>{i === null ? 'Borders are set; no pair is under consideration.' : `Cell (${i}, ${j}): pair ${a} with ${b}${pair !== null && pair !== undefined ? `, candidate ${pair}` : ''}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Three options per cell:</strong> skip the current element of the first list, skip the current element of the second list, or use the current pair.</p>
    <p><strong>Nonempty rule:</strong> the pair may only add to a previous total when that total is positive; otherwise the pair starts fresh, which keeps the answer nonempty.</p>
  </>} />
}
