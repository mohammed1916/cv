import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Look for unseen land.' },
    { id: 'explore', label: 'Collect island', description: 'Gather every cell of the island that was found.' },
    { id: 'new', label: 'New shape', description: 'No earlier island matches this one under rotation or reflection.' },
    { id: 'repeat', label: 'Same shape', description: 'This island matches an earlier one after a rotation or reflection.' },
    { id: 'done', label: 'Complete', description: 'Count the distinct shapes.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Grid (JSON array of 0/1 strings)',
  url: 'https://leetcode.com/problems/number-of-distinct-islands-ii/',
  complexity: 'O(rows * columns) cells, with eight symmetric copies of each island. The visualization caps the grid at 10 by 10.',
  examples: [
    { label: 'Mirror pair', input: '["11000","10000","00011","00001"]' },
    { label: 'Square and L', input: '["11000","10000","00011","00011"]' },
  ],
}

export default function NumberOfDistinctIslandsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Grid (island highlighted)" values={run.grid} activeCell={step.cell} relatedCells={step.island} />
    <output aria-label="Shapes">{`Distinct shapes so far: ${step.shapes}`}</output>
  </>} renderReasoning={() => <>
    <p>Two islands are the same shape if one can be turned into the other by rotating or reflecting it, then sliding it. Each island therefore gets eight symmetric copies.</p>
    <p>Its key is the smallest of those copies, moved to the origin. Islands with the same key are counted once.</p>
  </>} />
}
