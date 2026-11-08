import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No pair of rows is chosen yet.' },
    { id: 'pair', label: 'Row pair', description: 'Count the columns where both rows have a 1.' },
    { id: 'done', label: 'Complete', description: 'The total is the sum over every pair of rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON array of 0/1 rows)',
  url: 'https://leetcode.com/problems/number-of-corner-rectangles/',
  complexity: 'O(m^2 * n) time for m rows and n columns, and O(1) extra space.',
  examples: [
    { label: 'Three rows', input: '[[1,0,1,1],[1,1,0,1],[1,1,1,1]]' },
    { label: 'Sparse', input: '[[0,1],[1,0],[1,1]]' },
    { label: 'Water only', input: '[[0]]' },
    { label: 'Single land cell', input: '[[1]]' },
    { label: 'Full rectangle', input: '[[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1]]' },
    { label: 'Long run: 10 by 10', input: '[[1,1,1,1,1,1,0,0,1,0],[1,1,1,0,1,1,1,0,1,0],[0,0,1,1,1,0,1,0,0,1],[1,1,0,1,1,0,1,0,0,1],[0,1,1,1,1,1,0,0,0,1],[1,1,0,0,1,0,1,0,1,1],[1,0,0,0,0,0,1,0,1,1],[0,1,1,1,1,1,0,0,0,0],[1,0,0,1,1,1,1,1,1,1],[1,0,1,1,1,0,0,1,0,1]]' },
  ],
}

export default function CornerRectangles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid (chosen rows and shared columns)" matrix={run.input}
      highlightedCells={(step.rows ?? []).flatMap(r => step.shared.map(c => ({ row: r, col: c })))}
      activeCell={null} />
    <p>{step.rows ? `Rows ${step.rows[0]} and ${step.rows[1]}: shared columns ${step.shared.join(', ') || 'none'}.` : 'No pair chosen yet.'}</p>
    <output aria-label="Total">{`Rectangles so far: ${step.total}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A rectangle is fixed by two rows and two columns whose four corners are all 1. For a fixed pair of rows, every two shared columns make exactly one rectangle.</p>
    <p>So the count for a row pair is k choose 2, where k is the number of shared columns.</p>
  </>} />
}
