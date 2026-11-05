import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2022',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Flat array with m and n (JSON)',
  url: 'https://leetcode.com/problems/convert-1d-array-into-2d-array/',
  complexity: 'O(m * n) time to copy every value once.',
  examples: [
    { label: 'Three by two', input: '{"original":[5,6,7,8,9,10],"m":3,"n":2}' },
    { label: 'One column', input: '{"original":[4,9,2],"m":3,"n":1}' },
    { label: 'Mismatch', input: '{"original":[1,2,3],"m":2,"n":2}' },
  ],
}

export default function Convert1dTo2d() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { original, m, n, rows, r, ok } = step.snapshot
    return <>
      <div aria-label="Flat array" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {original.map((v, i) => <span key={i} style={{
          border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', color: 'var(--text)',
          background: ok && r >= 0 && i >= r * n && i < (r + 1) * n ? 'var(--primary-glow)' : 'transparent',
        }}>{v}</span>)}
      </div>
      {ok ? <table aria-label="Constructed grid" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}>
        <tbody>{Array.from({ length: m }, (_, row) => <tr key={row}>
          {Array.from({ length: n }, (_, col) => <td key={col} style={{ border: '1px solid var(--border)', padding: '2px 8px', fontFamily: 'monospace', textAlign: 'center' }}>
            {rows[row] ? rows[row][col] : ''}
          </td>)}
        </tr>)}</tbody>
      </table> : <p>{original.length} values cannot fill {m} x {n}.</p>}
    </>
  }} renderReasoning={() => <p>Reading the flat array in order and cutting it every n values fills the grid row by row; the total count must equal m times n.</p>} />
}
