import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Zero values split into zero pieces at cost zero.' },
    { id: 'cell', label: 'Last piece', description: 'Try every start for the last piece and keep the cheapest total.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest split of all values into k pieces.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/partition-array-to-minimize-xor/',
  complexity: 'O(k * n^2) time and O(k * n) space. The visualization caps nums at 6 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":1}' },
    { label: 'Example 2', input: '{"nums":[1,2,3],"k":3}' },
  ],
}

export default function PartitionArrayMinimizeXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Cheapest total (rows: pieces, columns: values used)" values={step.table}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Splitting into ${run.input.k} pieces`}</output>
  </>} renderReasoning={() => <>
    <p>Each piece costs the XOR of its values, and the pieces are contiguous and non-empty.</p>
    <p>The cell for p pieces and e values tries every start for the last piece and adds that piece's XOR to the best split before it.</p>
  </>} />
}
