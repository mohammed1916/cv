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
    { label: 'Eight values, mixed', input: '[12,3,7,20,9,9,30,4]' },
    { label: 'Four values, two equal', input: '[3,8,8,1]' },
    { label: 'Two values', input: '[1,50]' },
    { label: 'Equal values at every position', input: '[7,7,7,7]' },
    { label: 'Boundary values alternate', input: '[50,1,50,1,50,1]' },
    { label: 'Long run: 40 numbers', input: '[28,26,33,10,44,44,28,38,16,37,44,13,4,33,11,33,46,50,22,5,50,34,32,33,44,14,7,37,19,24,49,49,29,14,33,24,6,45,40,37]' },
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
