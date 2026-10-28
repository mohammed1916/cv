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
