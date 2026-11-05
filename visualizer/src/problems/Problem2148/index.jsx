import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2148',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON',
  url: 'https://leetcode.com/problems/count-elements-with-strictly-smaller-and-greater-elements/',
  complexity: 'O(n) time and O(1) extra space beyond the bounds.',
  examples: [
    { label: 'Two in the middle', input: '[11,7,2,15,7]' },
    { label: 'All equal', input: '[5,5,5]' },
  ],
}

export default function Problem2148Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Values (smallest ${step.low}, largest ${step.high})`} length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={i => step.marks[i] === 'min' ? 'min' : step.marks[i] === 'max' ? 'max' : ''} />
          <p>Counted so far: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
