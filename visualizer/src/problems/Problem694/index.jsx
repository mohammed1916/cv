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
    { label: 'Single cell', input: '["1"]' },
    { label: 'No shapes', input: '["000","000"]' },
    { label: 'Full-width rows', input: '["111111111111111000000000000000","000000000000000111111111111111"]' },
    { label: 'Long run: 30 by 30 grid', input: '["011100110100011000011101100010","100101101101011001110000101111","100101001011011000100100000010","111010011000001011110001011011","000110111111001110100100100111","001100101110001100010000011100","110011001110111011001101011011","111101111001000000010110110110","100111010011110110000001110010","111101010010001000001010100001","001010100101110011111101110010","010001010000110110100001110111","001110001000010101011000110100","011001100011110001000101100110","010100101111010001011110101000","101111111011001001111000000000","110001000111011000001011001110","110010110101001001000010100000","010101011101000010011010010001","111001010011010001000100011101","010001011110111001111111100010","000100110101001101100110011111","111110000111000111110001110110","110101100000100011000011111000","011011010111000101111000001101","101000001000001010010001011011","010101010010101110111001001000","111110000011010110011010011000","111011000000100000010001011011","100100110001111110111001001000"]' },
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
