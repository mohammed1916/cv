import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import KeptView from './KeptView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2216',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers, e.g. [1,1,2,3,5]',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-array-beautiful/',
  complexity: 'O(n) time and O(n) space for the kept list. The page caps the array at 14 values from 0 to 5.',
  examples: [
    { label: 'Leading pair', input: '[1,1,2,3,5]' },
    { label: 'Two pairs', input: '[1,1,2,2,3,3]' },
    { label: 'Odd leftover', input: '[1,2,3]' },
  ],
}

export default function Problem2216Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <KeptView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
