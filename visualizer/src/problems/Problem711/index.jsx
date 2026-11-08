import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Look for unseen land.' },
    { id: 'explore', label: 'Collect island', description: 'Gather every cell of the island that was found.' },
    { id: 'new', label: 'New shape', description: 'No earlier island matches this one under rotation or reflection.' },
    { id: 'repeat', label: 'Same shape', description: 'This island matches an earlier one after a rotation or reflection.' },
    { id: 'done', label: 'Complete', description: 'Count the distinct shapes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON array of 0/1 strings)',
  url: 'https://leetcode.com/problems/number-of-distinct-islands-ii/',
  complexity: 'O(rows * columns) cells, with eight symmetric copies of each island. The visualization caps the grid at 10 by 10.',
  examples: [
    { label: 'Rotated L', input: '["11000","10000","00100","00110"]' },
    { label: 'Two shapes', input: '["1110","1000","0000","0011"]' },
    { label: 'Single cell', input: '["1"]' },
    { label: 'No shapes', input: '["000","000"]' },
    { label: 'Full grid, one shape', input: '["1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111","1111111111"]' },
    { label: 'Long run: 10 by 10', input: '["0000110111","1010100101","0001111111","1110000000","1010101011","0101000011","1100110011","0101010100","0000100101","1111010101"]' },
  ],
}

export default function NumberOfDistinctIslandsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid (island highlighted)" matrix={run.grid}
      activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null}
      highlightedCells={step.island.map(([row, col]) => ({ row, col }))} />
    <output aria-label="Shapes">{`Distinct shapes so far: ${step.shapes}`}</output>
    {step.key && <p><strong>Canonical key:</strong> <code>{step.key}</code></p>}
  </>} renderReasoning={() => <>
    <p>Two islands are the same shape if one can be turned into the other by rotating or reflecting it, then sliding it. Each island therefore gets eight symmetric copies.</p>
    <p>Its key is the smallest of those copies, moved to the origin. Islands with the same key are counted once.</p>
  </>} />
}
