import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2164',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON',
  url: 'https://leetcode.com/problems/sort-even-and-odd-indices-independently/',
  complexity: 'O(n log n) time for the two sorts; O(n) space.',
  question: "Sort the values at even indices in ascending order and the values at odd indices in descending order.",
  approaches: [
    { name: "Split, sort, and merge back", intuition: "Collect the even-index values and sort them ascending, collect the odd-index values and sort them descending, then fill the positions in order.", time: "O(n log n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Four values', input: '[9,4,2,7]' },
    { label: 'Five values', input: '[5,30,1,2,8]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Equal values on both sides', input: '[5,5,5,5]' },
    { label: 'Largest input, 30 values', input: '[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]' },
    { label: 'Long run: 30 values', input: '[58,31,74,24,71,90,54,43,84,26,83,7,60,59,22,87,17,44,22,50,21,95,17,83,92,26,93,87,44,89]' },
  ],
}

export default function Problem2164Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Original array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={i => (i % 2 === 0 ? 'even index' : 'odd index')} />
          <IndexedSequence label="Result so far" length={step.placed.length || 1} valueAt={i => (step.placed[i] ?? '·')} active={step.placed.length - 1} roleAt={i => (i % 2 === 0 ? 'even' : 'odd')} />
          <p>Even indices (ascending): {step.evens.join(', ')} · odd indices (descending): {step.odds.join(', ') || 'none'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
