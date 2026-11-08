import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count the 1s in every row and column.' },
    { id: 'corner', label: 'Corner', description: 'Pair a corner 1 with a 1 in its row and a 1 in its column.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of 0s and 1s as a list of rows, JSON',
  url: 'https://leetcode.com/problems/right-triangles/',
  complexity: 'O(rows times cols) time and space. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '[[0,1,0],[0,1,1],[0,1,0]]' },
    { label: 'Example 2', input: '[[1,0,1],[1,0,0],[1,0,0]]' },
    { label: "Single zero cell", input: "[[0]]" },
    { label: "Single one cell", input: "[[1]]" },
    { label: "Equal rows", input: "[[1,1,1],[1,1,1]]" },
    { label: "Longest allowed: 6 by 6", input: "[[1,0,0,1,0,0],[0,0,1,0,0,1],[0,1,0,0,1,0],[1,0,0,1,0,0],[0,0,1,0,0,1],[0,1,0,0,1,0]]" },
    { label: "Long run: 6 by 6 random grid", input: "[[1,0,1,0,1,0],[1,0,1,0,1,0],[1,0,1,0,1,0],[1,0,1,0,1,0],[1,0,1,0,1,0],[1,0,1,0,1,0]]" },
  ],
}

export default function RightTriangles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [cr, cc] = step.cell ?? [-1, -1]
    const partners = []
    if (step.cell) {
      run.matrix.forEach((row, r) => row.forEach((v, c) => {
        if (v === 1 && (r === cr) !== (c === cc) && (r === cr || c === cc)) partners.push({ row: r, col: c })
      }))
    }
    return <>
      <MatrixGrid matrix={run.matrix} label="Grid of 1s" tone="main"
        activeCell={step.cell ? { row: cr, col: cc } : null} highlightedCells={partners} cellWidth={48} cellHeight={44} />
      <p className="algorithm-workspace__event" role="status">{step.message}</p>
      <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
    </>
  }} renderReasoning={() => <>
    <p>Pick a 1 as the right-angle corner. Any other 1 in its row and any other 1 in its column completes a triangle, so the corner contributes (row count minus 1) times (column count minus 1).</p>
    <p>Highlighted cells are the partners that pair with the active corner.</p>
  </>} />
}
