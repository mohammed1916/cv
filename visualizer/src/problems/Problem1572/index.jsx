import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1572',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Square matrix as rows (JSON)',
  url: 'https://leetcode.com/problems/matrix-diagonal-sum/',
  complexity: 'O(n) time and O(1) extra space: one pass that adds two cells per row.',
  examples: [
    { label: 'Two by two', input: '[[2,0],[1,3]]' },
    { label: 'Odd centre', input: '[[5,1,4],[0,9,2],[7,3,6]]' },
    { label: 'Single cell', input: '[[4]]' },
  ],
}

export default function MatrixDiagonalSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { total, counted, row, col } = step.snapshot
    const mat = run.input
    const n = mat.length
    const isCounted = (r, c) => counted.some(([cr, cc]) => cr === r && cc === c)
    return <>
      <table aria-label="Matrix cells" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>
          {mat.map((rowValues, r) => <tr key={r}>
            {rowValues.map((v, c) => {
              const active = r === row && c === col
              const diag = r === c || r + c === n - 1
              return <td key={c} style={{
                width: 44, height: 40, textAlign: 'center', border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
                background: isCounted(r, c) ? '#bbf7d0' : diag ? 'var(--surface2)' : 'transparent', color: '#1c1917',
              }}>{v}</td>
            })}
          </tr>)}
        </tbody>
      </table>
      <p>Diagonal total so far: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two diagonals:</strong> the main diagonal is the cells where row equals column; the other is where row plus column equals n - 1.</p>
    <p><strong>Shared centre:</strong> in an odd grid the diagonals cross in one cell, so that cell is added only once.</p>
  </>} />
}
