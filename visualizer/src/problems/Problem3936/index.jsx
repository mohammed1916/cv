import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ZeroSwapView from './ZeroSwapView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: '3936',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 1 to 12 integers from 0 to 9',
  url: 'https://leetcode.com/problems/minimum-swaps-to-move-zeros-to-end/',
  complexity: 'O(n) time and O(n) space for n values. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Zeros in front', input: '[0, 4, 0, 7, 1]' },
    { label: 'Mixed tail', input: '[5, 0, 3, 0]' },
  ],
}

export default function Problem3936Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <><IndexedSequence label="array" length={step.arr.length} valueAt={i => step.arr[i]} roleAt={i => i === step.left ? 'l' : i === step.right ? 'r' : ''} /><ZeroSwapView run={run} step={step} /></>}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
