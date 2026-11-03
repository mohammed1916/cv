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
  ],
}

const cell = (on, highlighted) => ({
  width: 34, height: 34, display: 'grid', placeItems: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
  border: `${highlighted ? 2 : 1}px solid ${highlighted ? 'var(--text)' : 'var(--border)'}`,
  background: on ? '#bbf7d0' : 'transparent', color: '#1c1917',
})

export default function CountSubmatrices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { row, heights, right, left, low, total } = step.snapshot
    return <>
      <table aria-label="Grid" style={{ borderCollapse: 'collapse' }}><tbody>
        {run.input.map((line, r) => <tr key={r} style={{ background: r === row ? 'var(--surface2)' : 'transparent' }}>
          {line.map((v, c) => <td key={c} style={cell(v === 1, r === row && c === right)}>{v}</td>)}
        </tr>)}
      </tbody></table>
      <p>Heights under each column: <span style={{ fontFamily: 'monospace' }}>{heights.join(' ')}</span></p>
      {left !== undefined && <p>Columns {left + 1} to {right + 1}, height capped at {low}.</p>}
      <p>Total so far: <strong>{total}</strong></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Fix the bottom row.</strong> A column height is the run of ones that ends at that row. A rectangle with this bottom row and a column span has as many heights as its shortest column.</p>
    <p><strong>Widen left from each right edge.</strong> Taking the running minimum gives the count for each span at once, and a zero stops the widening.</p>
  </>} />
}
