import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin before the first value.' },
    { id: 'replace', label: 'Replace', description: 'Turn each value into 0 for even or 1 for odd.' },
    { id: 'sort', label: 'Sort', description: 'Order the replaced values ascending.' },
    { id: 'done', label: 'Return', description: 'Return the sorted 0s and 1s.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON array of 1 to 12 integers from 0 to 1000)',
  url: 'https://leetcode.com/problems/transform-array-by-parity/',
  complexity: 'O(n log n) with a comparison sort. Counting the zeros and ones gives O(n).',
  examples: [
    { label: 'Example 1', input: '[4,3,2,1]' },
    { label: 'Example 2', input: '[1,5,1,4,2]' },
  ],
}

export default function ParityTransform() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input values" length={run.input.length} valueAt={i => run.input[i]}
      active={step.index} roleAt={i => (run.input[i] % 2 === 0 ? 'even' : 'odd')} />
    <IndexedSequence label="Replaced values" length={step.values.length || 1}
      valueAt={i => (step.values.length ? step.values[i] : '')} active={-1} />
    <output aria-label="Parity state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the parity of each value matters, so the values can be replaced by 0 for even and 1 for odd.</p>
    <p>Sorting the 0s and 1s puts every even before every odd, which is the required order.</p>
  </>} />
}
