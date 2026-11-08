import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FixedPointView from './FixedPointView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3920',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 1 to 12 integers from 0 to 12',
  url: 'https://leetcode.com/problems/maximize-fixed-points-after-deletions/',
  complexity: 'O(n^2) time and O(n) space for n values. The visualization caps the array at 12 values; the table keeps one cell per survivor count.',
  examples: [
    { label: 'Shifted start', input: '[3, 0, 4, 1]' },
    { label: 'Mixed run', input: '[5, 2, 6, 2, 1]' },
    { label: 'Single value', input: '[0]' },
    { label: 'Equal values', input: '[4,4,4]' },
    { label: 'Largest values alternating', input: '[12,0,12,0]' },
    { label: 'Long run: 12 items', input: '[10,11,8,1,2,1,7,5,10,8,9,11]' },
  ],
}

export default function Problem3920Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FixedPointView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
