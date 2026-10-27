import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the stone positions.' },
    { id: 'most', label: 'Most moves', description: 'The outer gaps bound the longest game.' },
    { id: 'window', label: 'Window', description: 'Check a window of span n that holds the most stones.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest and most moves.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with distinct stones positions (JSON)',
  url: 'https://leetcode.com/problems/moving-stones-until-consecutive-ii/',
  complexity: 'O(n log n) time for sorting and O(n) for the window. The visualization caps input at 10 stones.',
  examples: [
    { label: 'Example 1', input: '{"stones":[7,4,9]}' },
    { label: 'Example 2', input: '{"stones":[6,5,4,3,10]}' },
  ],
}

export default function MovingStones() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted stones" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.i}
      roleAt={i => (i >= step.i && i <= step.j ? 'window' : '')} />
    <output aria-label="Result">{`Fewest so far: ${step.least ?? '-'}. Most: ${step.most ?? '-'}.`}</output>
  </>} renderReasoning={() => <>
    <p>An endpoint stone may only move to an empty cell that is strictly inside the span, so the outer gaps decide the most moves.</p>
    <p>For the fewest moves, the best plan keeps as many stones as possible inside one window of span n.</p>
  </>} />
}
