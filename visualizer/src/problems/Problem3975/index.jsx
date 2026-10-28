import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the free window.' },
    { id: 'merge', label: 'Merge', description: 'Join intervals that overlap or touch.' },
    { id: 'trim', label: 'Trim', description: 'Keep the parts of each merged block outside the free window.' },
    { id: 'done', label: 'Return', description: 'The remaining intervals are the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"occupiedIntervals": [[s, e], ...], "freeStart": a, "freeEnd": b}',
  url: 'https://leetcode.com/problems/filter-occupied-intervals/',
  complexity: 'O(n log n) time for sorting, and O(n) extra space. The visualization caps the input at 8 intervals on 1 to 16.',
  examples: [
    { label: 'Example 1', input: '{"occupiedIntervals":[[2,6],[4,8],[10,10],[10,12],[14,16]],"freeStart":7,"freeEnd":11}' },
    { label: 'Example 2', input: '{"occupiedIntervals":[[1,5],[2,3]],"freeStart":3,"freeEnd":8}' },
  ],
}

export default function FilterOccupiedIntervals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Merged blocks">{`Merged: ${step.merged.map(([s, e]) => `[${s}, ${e}]`).join(', ') || 'none yet'}`}</output>
    <output aria-label="Answer so far">{`Answer so far: ${step.answer.map(([s, e]) => `[${s}, ${e}]`).join(', ') || 'none yet'}`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Sorting by start lets each interval be compared only with the last merged block.</p>
    <p>After merging, the free window can split a block into at most two pieces, one on each side.</p>
  </>} />
}
