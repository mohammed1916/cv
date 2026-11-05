import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShapeView from './ShapeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2210',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers, e.g. [2,4,1,1,6,5]',
  url: 'https://leetcode.com/problems/count-hills-and-valleys-in-an-array/',
  complexity: 'O(n) time and O(n) space for the compressed array. The page caps the array at 14 values from 0 to 9.',
  examples: [
    { label: 'Repeats collapse', input: '[2,4,1,1,6,5]' },
    { label: 'Monotone runs', input: '[6,6,5,5,4,1]' },
    { label: 'Single valley', input: '[3,1,1,3]' },
  ],
}

export default function Problem2210Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShapeView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
