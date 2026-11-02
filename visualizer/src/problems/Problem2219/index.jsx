import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SumScoreView from './SumScoreView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2219',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [4,3,-2,5])',
  url: 'https://leetcode.com/problems/maximum-sum-score-of-array/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 12 values with magnitude up to 100; the draft does not verify the official bounds.',
  examples: [
    { label: 'Mixed signs', input: '[4,3,-2,5]' },
    { label: 'Two values', input: '[1,-1]' },
    { label: 'All negative', input: '[-3,-1,-2]' },
  ],
}

export default function Problem2219Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SumScoreView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
