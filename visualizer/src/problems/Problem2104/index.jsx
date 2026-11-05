import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2104',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [1,3,2])',
  url: 'https://leetcode.com/problems/sum-of-subarray-ranges/',
  complexity: 'O(n) time and O(n) space with monotonic stacks; the visualization draws the boundaries of each element.',
  examples: [
    { label: 'Short array', input: '[1,3,2]' },
    { label: 'Repeated values', input: '[4,4,-1,2]' },
    { label: 'Descending', input: '[5,4,3]' },
  ],
}

export default function Problem2104Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Array with the span boundaries" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={Object.keys(step.marks).map(Number).find(k => step.marks[k] === 'current') ?? -1} roleAt={i => step.marks[i] === 'current' ? 'current' : step.marks[i] === 'l' ? 'left l' : step.marks[i] === 'r' ? 'right r' : ''} />
          <p>Running sum of this pass: {step.subtotal}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
