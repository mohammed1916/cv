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
    { label: 'Single cell', input: '[[5]]' },
    { label: 'Equal entries', input: '[[1,1],[1,1]]' },
    { label: 'All zeros', input: '[[0,0],[0,0]]' },
    { label: 'Largest: 8 by 8 extremes', input: '[[-9,9,-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9,9,-9],[-9,9,-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9,9,-9],[-9,9,-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9,9,-9],[-9,9,-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9,9,-9]]' },
    { label: 'Long run: 8 by 8', input: '[[-7,4,-8,4,-5,4,-2,-6],[1,-9,-6,9,8,-9,-3,2],[-4,8,-5,-8,3,-6,-5,4],[7,3,6,5,-3,6,-4,-1],[4,-7,2,2,-8,0,2,-1],[-1,3,2,8,7,3,2,8],[3,7,7,-7,-9,2,8,-8],[-1,-4,-8,0,8,1,-9,-3]]' },
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
                background: isCounted(r, c) ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : diag ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
              }}>{v}</td>
            })}
          </tr>)}
        </tbody>
      </table>
      <p>Highlighted cells are already in the total. Shaded cells lie on a diagonal.</p>
      <p>Diagonal total so far: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two diagonals:</strong> the main diagonal is the cells where row equals column; the other is where row plus column equals n - 1.</p>
    <p><strong>Shared centre:</strong> in an odd grid the diagonals cross in one cell, so that cell is added only once.</p>
  </>} />
}
