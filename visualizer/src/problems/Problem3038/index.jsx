import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Fix the score from the first two numbers.' },
    { id: 'pair', label: 'Pair', description: 'Take the front pair when it matches the score.' },
    { id: 'stop', label: 'Stop', description: 'Stop at the first pair that breaks the score.' },
    { id: 'done', label: 'Complete', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 2 to 40 integers from 1 to 1000, for example [3,2,1,4,5]',
  url: 'https://leetcode.com/problems/maximum-number-of-operations-with-the-same-score-i/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 40 numbers.',
  examples: [
    { label: 'Example 1', input: '[3,2,1,4,5]' },
    { label: 'Example 2', input: '[3,2,6,1,4]' },
  ],
}

export default function MaxOperationsSameScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (index < step.used ? 'removed' : '')} />
    <output aria-label="Operations">{`Operations so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Every operation must have the same score, so the score is fixed by the first two numbers.</p>
    <p>Taking pairs from the front is forced, so the count stops at the first pair with a different sum.</p>
  </>} />
}
