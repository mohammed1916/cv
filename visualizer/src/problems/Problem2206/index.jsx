import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairCountView from './PairCountView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2206',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array with an even number of integers, e.g. [3,2,3,2,2,2]',
  url: 'https://leetcode.com/problems/divide-array-into-equal-pairs/',
  complexity: 'O(n) time and O(n) space for the counts. The page caps the array at 16 values from 1 to 9.',
  examples: [
    { label: 'Even counts', input: '[3,2,3,2,2,2]' },
    { label: 'All distinct', input: '[1,2,3,4]' },
    { label: 'Mixed counts', input: '[1,1,1,1,2,2]' },
    { label: 'Smallest pair', input: '[1,1]' },
    { label: 'Long run: 16 values', input: '[7,2,7,5,2,9,5,1,3,8,1,4,6,9,2,6]' },
    { label: 'Largest values', input: '[9,9,9,9,9,9,9,9,1,1,1,1,1,1,1,1]' },
  ],
}

export default function Problem2206Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairCountView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
