import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'All bits', description: 'Begin with every bit up to the highest set bit.' },
    { id: 'clear', label: 'Clear', description: 'Every row still has a value that fits, so this bit can be cleared.' },
    { id: 'keep', label: 'Keep', description: 'Some row would have no value left, so this bit must stay.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum OR.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of values (JSON object with grid)',
  url: 'https://leetcode.com/problems/minimum-bitwise-or-from-grid/',
  complexity: 'O(b * m * n) time where b is the bit width. The visualization caps the grid at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,5],[2,4]]}' },
    { label: 'Example 2', input: '{"grid":[[3,5],[6,4]]}' },
    { label: 'One row', input: '{"grid":[[7,9,8]]}' },
    { label: 'Single cell', input: '{"grid":[[5]]}' },
    { label: 'Equal values in a square', input: '{"grid":[[2,2],[2,2]]}' },
    { label: 'One row of largest values', input: '{"grid":[[100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,1]]}' },
    { label: 'Long run: 5 by 6 grid', input: '{"grid":[[29519,17037,9149,55514,22281,79058],[14197,78146,35821,46403,89104,61440],[34765,43262,86254,40685,92249,8420],[45888,2848,51715,27710,30551,60854],[44281,84102,1296,91671,92545,11029]]}' },
  ],
}

export default function MinimumBitwiseOrGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const flat = run.input.grid.flat()
    return <>
      <IndexedSequence label="Grid values (row by row)" length={flat.length} valueAt={i => flat[i]} active={-1} />
      <output aria-label="Mask">{`Bit ${step.bit ?? '-'}, candidate ${step.candidate ?? '-'}, answer ${step.answer}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The check asks only whether each row has a value whose bits are all inside the candidate mask. Clearing the highest bit that still works first gives the smallest possible OR.</p>
  </>} />
}
