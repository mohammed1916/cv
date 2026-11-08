import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'label', label: 'Label islands', description: 'Flood-fill each island and record its size.' },
    { id: 'flip', label: 'Try a flip', description: 'Join the islands next to a 0 cell.' },
    { id: 'done', label: 'Complete', description: 'The best size wins.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON array of 0/1 rows)',
  url: 'https://leetcode.com/problems/making-a-large-island/',
  complexity: 'O(n^2) time and O(n^2) space for n by n grids.',
  examples: [
    { label: 'Bridge', input: '[[1,0,1],[0,0,0],[1,0,1]]' },
    { label: 'Solid', input: '[[1,1],[1,1]]' },
    { label: 'Corner', input: '[[1,1,0],[1,0,0],[0,0,1]]' },
    { label: 'Single cell, empty', input: '[[0]]' },
    { label: 'Single cell, full', input: '[[1]]' },
    { label: 'Two equal islands', input: '[[1,0],[0,1]]' },
    { label: 'Long run: 8 by 8 grid', input: '[[1,0,0,1,0,1,0,1],[1,1,1,1,0,1,0,0],[0,0,1,0,1,0,0,1],[0,0,1,1,1,1,1,1],[1,0,0,0,0,0,0,0],[1,1,0,1,0,0,0,1],[1,1,0,1,0,1,1,1],[1,1,1,1,0,0,0,0]]' },
  ],
}

export default function LargeIsland() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Islands (cell values; flipped cell highlighted)" matrix={run.input}
      activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} />
    <table aria-label="Island labels"><tbody>
      {step.id.map((row, r) => <tr key={r}>{row.map((label, c) => <td key={c}>{label < 0 ? '·' : label}</td>)}</tr>)}
    </tbody></table>
    <p>{`Island sizes: ${step.size.join(', ') || 'none'}`}</p>
    <output aria-label="Best">{`Best so far: ${step.best}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each island gets a label and a size. A 0 cell that becomes land touches some islands; the new island is 1 plus the sizes of the distinct islands beside it.</p>
    <p>Counting each neighbouring island once matters, because two sides of a cell can touch the same island.</p>
  </>} />
}
