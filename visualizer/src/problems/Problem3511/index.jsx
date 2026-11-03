import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowHitView from './WindowHitView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3511',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of integers, for example [2,-3,1,4,-5,2]',
  url: 'https://leetcode.com/problems/make-a-positive-array/',
  complexity: 'O(n^3) time for n values in this trace: every window is summed directly. The replacement choice is a greedy stab of intervals sorted by right end, O(w log w) for w bad windows. The visualization caps the array at 10 values.',
  examples: [
    { label: 'Two overlapping dips', input: '[2,-3,1,4,-5,2]' },
    { label: 'Already positive', input: '[3,1,2,5]' },
    { label: 'One deep dip', input: '[1,1,-7,1,1]' },
  ],
}

export default function MakeAPositiveArrayVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WindowHitView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
