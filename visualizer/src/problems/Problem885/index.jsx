import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const DIR_NAMES = ['east', 'south', 'west', 'north']

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Visit the starting cell.' },
    { id: 'walk', label: 'Walk outside', description: 'A step that lands outside the grid is not recorded.' },
    { id: 'record', label: 'Record cell', description: 'A step that lands inside the grid is appended.' },
    { id: 'turn', label: 'Turn / widen', description: 'Turn clockwise; widen the legs every two turns.' },
    { id: 'done', label: 'Complete', description: 'Every cell has been visited.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Input [rows, cols, rStart, cStart] (JSON)',
  url: 'https://leetcode.com/problems/spiral-matrix-iii/',
  complexity: 'O(max(rows, cols)^2) time: the spiral may wander outside the grid but visits each of rows*cols cells once.',
  question: "Walk a spiral from a starting cell on an unbounded grid until every cell of an R by C grid is visited; return the visiting order.",
  approaches: [
    { name: "Spiral with growing steps", intuition: "Walk in the order right, down, left, up, lengthening the step every two turns and recording cells inside the grid.", time: "O(max(R, C)^2)", space: "O(R * C)" },
  ],
  examples: [
    { label: '1x4 from (0,0)', input: '[1,4,0,0]' },
    { label: '5x6 from (1,4)', input: '[5,6,1,4]' },
    { label: '3x3 centre', input: '[3,3,1,1]' },
    { label: 'Single cell', input: '[1,1,0,0]' },
    { label: 'Symmetric start', input: '[6,6,2,3]' },
    { label: 'Corner start', input: '[12,12,0,11]' },
    { label: 'Long run: 12 by 11 grid', input: '[12,11,6,5]' },
  ],
}

export default function SpiralMatrixIII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const [r, c] = step.pos
      const inside = r >= 0 && r < step.grid.length && c >= 0 && c < step.grid[0].length
      return <>
        <DPTable title="Visit order (blank = not yet visited)" values={step.grid} activeCell={inside ? { row: r, column: c } : null} />
        <output aria-label="Walker">Position ({r}, {c}) {inside ? '' : '(outside the grid) '}heading {DIR_NAMES[step.dir]}; leg length {step.step}; visited {step.count}</output>
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Pattern:</strong> clockwise spiral legs have lengths 1, 1, 2, 2, 3, 3, ... Since the walker may leave the grid and re-enter, it keeps walking and only records in-bounds cells, stopping once all rows*cols cells are seen.</p>
    </>} />
}
