import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort a copy so the smallest and largest numbers sit at the ends.' },
    { id: 'pair', label: 'Pair', description: 'Average the smallest and largest remaining numbers.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest average.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 2 to 40 integers from 1 to 50 with an even count, for example [7,8,3,4,15,13,4,1]',
  url: 'https://leetcode.com/problems/minimum-average-of-smallest-and-largest-elements/',
  complexity: 'O(n log n) time for the sort. The visualization caps the array at 40 numbers.',
  examples: [
    { label: 'Example 1', input: '[7,8,3,4,15,13,4,1]' },
    { label: 'Example 2', input: '[1,9,8,3,10,5]' },
  ],
}

export default function MinimumAverageOfPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted numbers" length={run.sorted.length} valueAt={index => run.sorted[index]} active={step.index}
      roleAt={index => (index === step.index || index === step.partner ? 'pair' : '')} />
    <output aria-label="Best average">{`Best average so far: ${step.best ?? 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each round removes the current minimum and maximum, so the pairs formed are the mirror positions of the sorted list.</p>
    <p>The answer is the smallest of those mirror averages.</p>
  </>} />
}
