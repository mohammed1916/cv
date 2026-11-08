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
    { label: 'Four values with zero', input: '[0,250,80,999]' },
    { label: 'Six growing values', input: '[3,9,27,81,243,729]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Equal values', input: '[5,5,5,5]' },
    { label: 'Largest values alternate with zero', input: '[1000,0,1000,0,1000,0,1000,0,1000,0,1000,0]' },
    { label: 'All zeros', input: '[0,0,0]' },
    { label: 'Long run: 12 values', input: '[582,388,915,693,996,515,794,366,809,100,479,44]' },
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
