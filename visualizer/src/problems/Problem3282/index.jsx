import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the first value as the largest so far.' },
    { id: 'step', label: 'Step', description: 'Each position pays the largest value seen up to it.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 2 to 30 integers from 1 to 50, for example [1,3,1,5]',
  url: 'https://leetcode.com/problems/reach-end-of-array-with-max-score/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 30 numbers.',
  examples: [
    { label: 'Example 1', input: '[1,3,1,5]' },
    { label: 'Example 2', input: '[4,3,1,3,2]' },
  ],
}

export default function MaxScoreToEnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (index === step.bestIndex ? 'largest so far' : '')} />
    <output aria-label="Score">{`Largest so far: ${step.best}. Score so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A jump from i to j earns (j - i) times the value at i, so every position between two landmarks pays the value of the earlier landmark.</p>
    <p>The best choice is to pay the largest value seen so far at every position, which is a running maximum.</p>
  </>} />
}
