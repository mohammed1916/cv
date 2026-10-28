import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Process towers from the highest limit down.' },
    { id: 'assign', label: 'Assign', description: 'Give this tower the largest unused height it can take.' },
    { id: 'fail', label: 'Fail', description: 'No unused height of at least 1 is available.' },
    { id: 'done', label: 'Complete', description: 'Report the total height, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 1 to 8 height limits from 1 to 15 (JSON)',
  url: 'https://leetcode.com/problems/maximize-the-total-height-of-unique-towers/',
  complexity: 'O(n log n) for the sort. The visualization caps input at 8 towers.',
  examples: [
    { label: 'Example 1', input: '[2,3,4,3]' },
    { label: 'Example 2', input: '[2,2,1]' },
  ],
}

export default function UniqueTowers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Towers (limit to height)" length={run.input.length}
      valueAt={i => `${run.input[i]} to ${step.heights[i] ?? '-'}`}
      active={step.index} roleAt={i => (step.heights[i] !== null ? 'assigned' : '')} />
    <output aria-label="Total height">{`Total height so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each tower takes the tallest height it can, but must stay below the tower assigned just before it, so all heights differ.</p>
    <p>Handling the highest limits first leaves the most room for the rest, and a height below 1 means no valid assignment exists.</p>
  </>} />
}
