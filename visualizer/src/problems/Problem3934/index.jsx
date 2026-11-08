import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowCompareView from './WindowCompareView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3934',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 1 to 12 integers from 1 to 100',
  url: 'https://leetcode.com/problems/smallest-unique-subarray/',
  complexity: 'O(n^3) time in this direct comparison and O(1) extra space. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Repeated run', input: '[4, 4, 4]' },
    { label: 'Mixed values', input: '[1, 2, 1, 2, 3]' },
    { label: 'Single value', input: '[9]' },
    { label: 'Long equal run', input: '[2,2,2,2,2,2]' },
    { label: 'Largest values alternating', input: '[1,100,1,100,1,100,1,100,1,100,1,100]' },
    { label: 'Long run: 12 items', input: '[12,61,96,89,82,88,74,71,4,35,87,43]' },
  ],
}

export default function Problem3934Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WindowCompareView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
