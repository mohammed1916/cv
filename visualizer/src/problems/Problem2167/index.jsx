import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CarsView from './CarsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2167',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Car string of 0 and 1, e.g. 1100101',
  url: 'https://leetcode.com/problems/minimum-time-to-remove-all-cars-containing-illegal-goods/',
  complexity: 'O(n) time and O(n) space for the two cost tables. The visualization caps the string at 16 cars.',
  examples: [
    { label: 'Mixed', input: '1100101' },
    { label: 'Trailing clean cars', input: '0010' },
    { label: 'All clean', input: '0000' },
    { label: 'Single clean car', input: '0' },
    { label: 'Single illegal car', input: '1' },
    { label: 'Longest, all illegal', input: '1111111111111111' },
    { label: 'Long run: 16 cars', input: '0101110101110011' },
  ],
}

export default function Problem2167Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CarsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
