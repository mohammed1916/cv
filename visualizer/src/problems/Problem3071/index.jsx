import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Separate the Y cells from the rest.' },
    { id: 'y', label: 'Y cell', description: 'This cell belongs to the Y.' },
    { id: 'other', label: 'Other', description: 'This cell lies outside the Y.' },
    { id: 'pair', label: 'Pair', description: 'Try one value for the Y and a different value for the rest.' },
    { id: 'improve', label: 'Improve', description: 'This pair needs fewer changes.' },
    { id: 'done', label: 'Result', description: 'The fewest changes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON square grid of odd size (3 to 7) with values 0, 1 or 2',
  url: 'https://leetcode.com/problems/minimum-operations-to-write-the-letter-y-on-a-grid/',
  complexity: 'O(n^2) time to count the cells and O(1) to try the six value pairs.',
  examples: [
    { label: 'Example 1', input: '[[1,2,2],[1,1,0],[0,1,2]]' },
    { label: 'Example 2', input: '[[1,1,1],[1,1,1],[1,1,1]]' },
  ],
}

export default function LetterY() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Counts">{`Y counts ${step.yCounts.join(', ')}; other counts ${step.otherCounts.join(', ')}`}</output>
    <output aria-label="Pair">{step.pair ? `Y becomes ${step.pair[0]}, rest becomes ${step.pair[1]}; best ${step.best ?? 'none'}` : step.cell ? `cell (${step.cell[0]}, ${step.cell[1]})` : 'counting'}</output>
  </>} renderReasoning={() => <>
    <p>The Y uses one value and the rest of the grid uses a different value. Counting how many cells of each value lie inside and outside the Y gives every cost in constant time.</p>
  </>} />
}
