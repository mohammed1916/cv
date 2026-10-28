import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty result', description: 'Start with an empty result list.' },
    { id: 'move', label: 'Move', description: 'Move each index by its value and copy the value found there.' },
    { id: 'done', label: 'Return', description: 'Return the transformed array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Circular array (JSON array of 1 to 12 integers from -100 to 100)',
  url: 'https://leetcode.com/problems/transformed-array/',
  complexity: 'O(n) time and O(n) space. Each move uses one modulo operation.',
  examples: [
    { label: 'Example 1', input: '[3,-2,1,1]' },
    { label: 'Example 2', input: '[-1,4,-1]' },
  ],
}

export default function TransformedArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input values" length={run.input.length} valueAt={i => run.input[i]} active={step.index} />
    <IndexedSequence label="Result so far" length={run.input.length}
      valueAt={i => (i < step.result.length ? step.result[i] : '')} active={step.result.length - 1} />
    <output aria-label="Move state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A positive value moves right and a negative value moves left, and the array wraps around like a circle.</p>
    <p>Adding the value to the index and taking the remainder modulo the length, then adding the length back for negatives, gives the landing index.</p>
    <p>A zero value lands on its own index, so the result copies it unchanged.</p>
  </>} />
}
