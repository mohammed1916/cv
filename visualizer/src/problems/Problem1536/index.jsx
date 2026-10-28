import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count zeros', description: 'Count the trailing zeros of every row.' },
    { id: 'place', label: 'Place row', description: 'Bubble the first suitable row up to this position.' },
    { id: 'stuck', label: 'Impossible', description: 'No row below has enough trailing zeros.' },
    { id: 'done', label: 'Complete', description: 'Report the number of adjacent swaps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid: a square 0/1 matrix up to 8 by 8',
  url: 'https://leetcode.com/problems/minimum-swaps-to-arrange-a-binary-grid/',
  complexity: 'O(n^3) time for an n by n grid in the worst case. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,0,1],[1,1,0],[1,0,0]]}' },
    { label: 'Impossible', input: '{"grid":[[0,1,1,0],[0,1,1,0],[0,1,1,0],[0,1,1,0]]}' },
  ],
}

export default function BinaryGridSwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Row positions (top to bottom)" length={step.order.length} valueAt={index => `row ${step.order[index]}`} active={step.row} />
    <output aria-label="Swaps">{`Adjacent swaps so far: ${step.swaps}`}</output>
    <output aria-label="Input size">{`Grid size: ${run.input.grid.length} by ${run.input.grid.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Position i needs a row with at least n - 1 - i trailing zeros, so the top rows need the most zeros.</p>
    <p>Taking the nearest suitable row and moving it up one swap at a time keeps the other rows in their relative order, which is what makes the total minimal.</p>
  </>} />
}
