import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan grid', description: 'Look for unvisited land, row by row.' },
    { id: 'island', label: 'Flood an island', description: 'Collect every cell in the island and record its shape.' },
    { id: 'done', label: 'Count shapes', description: 'Distinct shapes, not islands, are the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Grid (JSON array of 0/1 row strings)',
  url: 'https://leetcode.com/problems/number-of-distinct-islands/',
  complexity: 'O(R · C · log) time for the sorted island keys and O(R · C) space.',
  examples: [
    { label: 'Two shapes', input: '["11000","11011","00011","00100"]' },
    { label: 'Same shape', input: '["1100","1000","0011","0001"]' },
    { label: 'Single cell', input: '["0010"]' },
  ],
}

export default function DistinctIslands() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const matrix = run.input.map(row => row.split(''))
    const cell = step.cell
    return <>
      <MatrixGrid label="Grid (1 is land)" matrix={matrix}
        activeCell={cell ? { row: cell[0], col: cell[1] } : null}
        highlightedCells={(step.island ?? []).map(([row, col]) => ({ row, col }))} />
      <RecordStateTable label="Distinct shapes" columns={['shape key', 'islands']}
        rows={step.shapes.map(s => ({ 'shape key': s.key, islands: s.count }))} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why relative cells:</strong> moving an island does not change its shape, so subtracting the top-left corner gives every copy the same key.</p>
  </>} />
}
