import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BagsView from './BagsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2171',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bag sizes as JSON, e.g. [4,1,6,5]',
  url: 'https://leetcode.com/problems/removing-minimum-number-of-magic-beans/',
  complexity: 'O(n log n) time for the sort and O(n) for the scan. The visualization caps the bags at 12, each from 1 to 20.',
  examples: [
    { label: 'Four bags', input: '[4,1,6,5]' },
    { label: 'Repeated size', input: '[2,10,3,2]' },
    { label: 'Equal bags', input: '[3,3,3]' },
  ],
}

export default function Problem2171Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BagsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
