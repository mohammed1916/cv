import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1314',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix and distance k (JSON)',
  url: 'https://leetcode.com/problems/matrix-block-sum/',
  complexity: 'O(m × n) time for the prefix table and every block query, and O(m × n) space.',
  examples: [
    { label: 'Two by three', input: '{"mat":[[1,1,0],[0,2,1]],"k":1}' },
    { label: 'Square', input: '{"mat":[[3,0],[1,4]],"k":0}' },
    { label: 'Wide block', input: '{"mat":[[1,2,3,4]],"k":2}' },
  ],
}

export default function BlockSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { mat, rect, cell, ans } = step.snapshot
    const inside = (r, c) => rect && r >= rect[0] && r <= rect[1] && c >= rect[2] && c <= rect[3]
    return <>
      <table aria-label="Matrix with block highlight" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>{mat.map((row, r) => <tr key={r}>{row.map((v, c) => {
          const current = cell && cell[0] === r && cell[1] === c
          return <td key={c} style={{ width: 36, height: 36, textAlign: 'center', border: `${current ? 2 : 1}px solid ${current ? 'var(--text)' : 'var(--border)'}`,
            background: inside(r, c) ? 'var(--surface2)' : 'transparent' }}>{v}</td>
        })}</tr>)}</tbody>
      </table>
      {ans && <p aria-label="Block sums">Current results: {ans.map(row => row.join(' ')).join(' | ')}</p>}
      <p>{rect ? `Clipped block: rows ${rect[0]} to ${rect[1]}, columns ${rect[2]} to ${rect[3]}.` : 'Prefix sums are built from the top-left corner.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix table:</strong> P[r][c] is the sum of the first r rows and first c columns. Inclusion-exclusion turns any rectangle into four lookups.</p>
    <p><strong>Clipping:</strong> the block around (i, j) is clipped to the grid, so edge cells simply use fewer rows and columns.</p>
  </>} />
}
