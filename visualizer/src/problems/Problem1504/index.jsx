import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1504',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary grid as a JSON array of rows',
  url: 'https://leetcode.com/problems/count-submatrices-with-all-ones/',
  complexity: 'O(rows × columns²) time with this scan, and O(columns) extra space for the heights.',
  examples: [
    { label: 'Sample', input: '[[1,1,0,1],[1,1,1,1],[0,1,1,1]]' },
    { label: '2 by 2 block', input: '[[1,1],[1,1]]' },
    { label: 'Single zero', input: '[[0]]' },
    { label: 'Single cell', input: '[[1]]' },
    { label: 'All zeros', input: '[[0,0],[0,0]]' },
    { label: 'Full row of ones', input: '[[1,1,1,1,1,1]]' },
    { label: 'Long run: 6 by 6', input: '[[0,1,0,1,1,0],[1,1,0,0,1,1],[1,1,0,1,0,1],[0,1,1,1,1,0],[1,0,1,0,1,0],[0,1,1,0,1,1]]' },
  ],
}

const cell = (on, highlighted, inSpan) => ({
  width: 34, height: 34, display: 'grid', placeItems: 'center', fontFamily: 'monospace', boxSizing: 'border-box', color: 'var(--text)',
  border: `${highlighted ? 2 : 1}px solid ${highlighted ? 'var(--text)' : 'var(--border)'}`,
  background: inSpan ? 'color-mix(in srgb, var(--primary) 30%, var(--surface2))' : on ? 'color-mix(in srgb, var(--success) 30%, var(--surface2))' : 'transparent',
})

const marker = { height: 16, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'monospace', fontSize: 12 }

export default function CountSubmatrices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { row, heights, right, left, low, total } = step.snapshot
    const hasSpan = left !== undefined && right !== undefined
    const inSpan = (c, r) => hasSpan && r === row && c >= left && c <= right
    return <>
      <section aria-label="Grid">
        <h3>Bottom row {row >= 0 ? row + 1 : '-'} and its column span</h3>
        <table aria-label="Grid" style={{ borderCollapse: 'collapse' }}>
          <thead><tr>{run.input[0].map((_, c) => <th key={c} style={marker}>{hasSpan && c === left ? 'l' : ''}{hasSpan && c === right ? (c === left ? '/r' : 'r') : ''}</th>)}</tr></thead>
          <tbody>
            {run.input.map((line, r) => <tr key={r} style={{ background: r === row ? 'var(--surface2)' : 'transparent' }}>
              {line.map((v, c) => <td key={c} style={cell(v === 1, r === row && c === right, inSpan(c, r))}>{v}</td>)}
            </tr>)}
          </tbody>
        </table>
      </section>
      <section aria-label="Column heights">
        <h3>Heights: ones ending at this row, per column</h3>
        <p style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{heights.join('  ')}</p>
      </section>
      {hasSpan && <p>Span from column {left + 1} to column {right + 1}: the shortest column caps the height at {low}.</p>}
      <p>Total so far: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Fix the bottom row.</strong> A column height is the run of ones that ends at that row. A rectangle with this bottom row and a column span has as many heights as its shortest column.</p>
    <p><strong>Widen left from each right edge.</strong> Taking the running minimum gives the count for each span at once, and a zero stops the widening.</p>
  </>} />
}
