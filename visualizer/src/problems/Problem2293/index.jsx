import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The starting list of values.' },
    { id: 'pass', label: 'Pass', description: 'Combine adjacent pairs, alternating min and max.' },
    { id: 'done', label: 'Complete', description: 'Report the single value left.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (power-of-two length)',
  url: 'https://leetcode.com/problems/min-max-game/',
  complexity: 'O(n) time, since each pass halves the list. The visualization caps the list at 32 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,5,2,4,8,2,2]}' },
    { label: 'Example 2', input: '{"nums":[3]}' },
    { label: 'Two equal values', input: '{"nums":[4,4]}' },
    { label: 'Equal values, length four', input: '{"nums":[5,5,5,5]}' },
    { label: 'Thirty-two values, extremes', input: '{"nums":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: 16 values', input: '{"nums":[15,19,56,84,60,41,46,67,79,86,38,62,91,21,3,39]}' },
  ],
}

export default function MinMaxGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`List after pass ${step.round}`} length={step.values.length} valueAt={i => step.values[i]}
      active={-1} roleAt={i => (step.values.length > 1 && i % 2 === 1 ? 'max' : step.values.length > 1 ? 'min' : '')} />
  </>} renderReasoning={() => <>
    <p>Each pass pairs neighbors. Even positions in the new list take the smaller of the pair, odd positions take the larger.</p>
    <p>The list halves every pass, so the last value is the result after log2(n) passes.</p>
  </>} />
}
